const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
import { DbError } from '../errors';
import { userService } from '../user/userService';
import { config } from '../config';

export class Passport {
  constructor() {
    this.passport = require('passport');
  }

  config() {
    const { UserModel } = config.get;

    this.passport.serializeUser((user, done) => {
      return done(null, user._id);
    });

    this.passport.deserializeUser((_id, done) => {
      UserModel.findById(_id).then(
          (user) => done(null, user),
          (err) => done(err, false)
      );
    });

    // login user with password
    this.passport.use('local', new LocalStrategy(
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
          userService.isLoginExists(userCandidate.login)
              .then((userFromDb) => {
                user = userFromDb;
                return userService.isPasswordLocked(userFromDb);
              })
          // if password doesn't match then throw error with code 'wrongCredentials' here
              .then((userFromDb) => {
                return userService.isPasswordMatched(userCandidate.password, userFromDb._doc.password, userFromDb);
              }
              )
              .then((userFromDb) => {
                return done(null, userFromDb);
              })
              .catch((err) => {
                if (err.code === 'wrongCredentials') {
                  userService.updatePasswordLockOptions(user)
                      .then(() => done(err, false));
                } else {
                  done(err, false);
                }
              });
        }
    ));

    // login user after creation or change credentials
    // without password
    this.passport.use('localWithoutPassword', new LocalStrategy(
        {
          usernameField: 'login',
        },
        (login, password, done) => {
          userService.isLoginExists(login)
              .then((userFromDb) => {
                done(null, userFromDb);
              })
              .catch((err) => done(err, false));
        }
    ));

    // google sign in strategy
    this.passport.use(
        new GoogleStrategy(
            {
              clientID: config.get.googleClientID,
              clientSecret: config.get.googleClientSecret,
              callbackURL: config.get.googleCallbackURL + '/api/user/auth/google/redirect',
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
    jwtOptions.secretOrKey = config.get.JWTSecret;

    this.passport.use('jwt',
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
    emailVerificationOptions.secretOrKey = config.get.JWTEmail;

    // pass req object to callback as first argument
    emailVerificationOptions.passReqToCallback = true;

    this.passport.use('jwt.email.verification',
        new JwtStrategy(emailVerificationOptions,
            (req, jwtPayload, done) => {

              // check that user which logged in is the same that user who veryfing email
              if (req.user._doc._id.toString() === jwtPayload.sub._id.toString()) {
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
              } else {
                done(null, false);
              }
            }
        ));

    const jwtOptionsPasswordResetCheckCode = {};
    jwtOptionsPasswordResetCheckCode.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    jwtOptionsPasswordResetCheckCode.secretOrKey = config.get.JWTSecretCode;
    // extract _id from token to identify user, which resets password
    this.passport.use('jwt.passwordResetCheckCode',
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
    jwtOptionsPasswordReset.secretOrKey = config.get.JWTSecretChangePassword;

    this.passport.use('jwt.passwordReset',
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
  }

  get get() {
    return this.passport;
  }
}

export const passport = new Passport();

