const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
import { DbError } from './errors';
import { userService } from './user/userService';

class Config {
  constructor() {
    // make singleton
    if (Config.exists) {
      return Config.instance;
    }
    Config.instance = this;
    Config.exists = true;
    // initialization
    this.options = {};
    this.userService = userService;
  }

  get get() {
    return this.options;
  }

  getOptions() {
    return this.options;
  }

  init(options) {
    this.options = options;
  }

  get emailTransporter() {
    return nodemailer.createTransport({
      service: 'Mailgun',
      auth: {
        user: this.get.emailUser,
        pass: this.get.emailPassword,
      },
    });
  }

  get passport() {
    const { UserModel } = this.get;

    passport.serializeUser((user, done) => {
      return done(null, user._id);
    });

    passport.deserializeUser((_id, done) => {
      UserModel.findById(_id).then(
          (user) => done(null, user),
          (err) => done(err, false)
      );
    });

    // login user with password
    passport.use('local', new LocalStrategy(
        {
          usernameField: 'login',
          passwordField: 'password',
        },
        (login, password, done) => {
          const userCandidate = {
            login,
            password,
          };
          let user;
          this.userService.isLoginExists(userCandidate.login)
              .then((userFromDb) => {
                user = userFromDb;
                console.log('userFromDb 0', userFromDb);
                return this.userService.isPasswordLocked(userFromDb);
              })
          // if password doesn't match then throw error with code 'wrongCredentials' here
              .then((userFromDb) => {
                console.log('userFromDb 0', userFromDb);
                return this.userService.isPasswordMatched(userCandidate.password, userFromDb._doc.password, userFromDb);
              }
              )
              .then((userFromDb) => {
                console.log('userFromDb', userFromDb);
                return done(null, userFromDb);
              })

              .catch((err) => {
                if (err.code === 'wrongCredentials') {
                  this.userService.updatePasswordLockOptions(user)
                      .then(() => done(err, false));
                } else {
                  done(err, false);
                }
              });
        }
    ));

    // login user after creation or change credentials
    // without password
    passport.use('localWithoutPassword', new LocalStrategy(
        {
          usernameField: 'login',
        },
        (login, password, done) => {
          this.userService.isLoginExists(login)
              .then((userFromDb) => {
                done(null, userFromDb);
              })
              .catch((err) => done(err, false));
        }
    ));
    // console.log('config.get.googleClientID', config.get.googleClientID);
    // google sign in strategy
    passport.use(
        new GoogleStrategy(
            {
              clientID: this.get.googleClientID,
              clientSecret: this.get.googleClientSecret,
              callbackURL: this.get.googleCallbackURL + '/api/user/auth/google/redirect',
            },
            (accessToken, refreshToken, profile, done) => {
              // extract 'account' email
              let email;
              for (let i = 0; i < profile.emails.length; i++) {
                if (profile.emails[i].type === 'account') {
                  email = profile.emails[i].value;
                  break;
                }
              }
              UserModel.findOne({ providersId: profile.id })
                  .then((user) => {
                    if (user) {
                      // if user is already in db update credentials
                      return user.set({
                        avatar: profile._json.image.url,
                        name: profile._json.name.givenName,
                        surname: profile._json.name.familyName,
                        accessToken,
                      }).save();
                    } else {
                      // if new user, create new record in db
                      return new UserModel({
                        provider: 'google',
                        login: 'gid_' + profile._json.id,
                        email,
                        avatar: profile._json.image.url,
                        name: profile._json.name.givenName,
                        surname: profile._json.name.familyName,
                        role: 'google',
                        ban: 0,
                        createdAt: Date.now(),
                        commentsReadedTill: Date.now(),
                        providersId: profile._json.id,
                        accessToken,
                        refreshToken,
                      }).save();
                    }
                  })
                  .then((user) => {
                    return done(null, user);
                  })
                  .catch((err) => done(new DbError(err), false));
            }
        ));

    const jwtOptions = {};
    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    jwtOptions.secretOrKey = this.get.JWTSecret;

    passport.use('jwt',
        new JwtStrategy(jwtOptions, (jwtPayload, done) => {
        // на основі _id (витягнутого з токена) робить пошук
        // в базі, чи є такий юзер, і ф-я done повертає відповідь

          UserModel.findOne({ _id: jwtPayload.sub._id })
              .then((user) => {
                if (user) {
                  done(null, user);
                } else {
                  done(null, false);
                }
              })
              .catch((err) => {
                done(err, false);
              });
        }
        ));

    const emailVerificationOptions = {};
    emailVerificationOptions.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('token');
    emailVerificationOptions.secretOrKey = this.get.JWTEmail;

    passport.use('jwt.email.verification',
        new JwtStrategy(emailVerificationOptions, (jwtPayload, done) => {
          UserModel.findOne({ _id: jwtPayload.sub._id })
              .then((user) => {
                if (user) {
                  done(null, user);
                } else {
                  done(null, false);
                }
              })
              .catch((err) => {
                done(err, false);
              });
        }
        ));

    const jwtOptionsPasswordResetCheckCode = {};
    jwtOptionsPasswordResetCheckCode.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    jwtOptionsPasswordResetCheckCode.secretOrKey = this.get.JWTSecretCode;
    // extract _id from token to identify user, which resets password
    passport.use('jwt.passwordResetCheckCode',
        new JwtStrategy(jwtOptionsPasswordResetCheckCode, (jwtPayload, done) => {
          UserModel.findOne({ _id: jwtPayload.sub._id })
              .then((user) => {
                if (user) {
                  done(null, user);
                } else {
                  done(null, false);
                }
              })
              .catch((err) => {
                done(err, false);
              });
        }
        ));

    const jwtOptionsPasswordReset = {};
    jwtOptionsPasswordReset.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    jwtOptionsPasswordReset.secretOrKey = this.get.JWTSecretChangePassword;

    passport.use('jwt.passwordReset',
        new JwtStrategy(jwtOptionsPasswordReset, (jwtPayload, done) => {
          UserModel.findOne({ _id: jwtPayload.sub._id })
              .then((user) => {
                if (user) {
                  done(null, user);
                } else {
                  done(null, false);
                }
              })
              .catch((err) => {
                done(err, false);
              });
        }
        ));
    return passport;
  }
}

export const config = new Config();
