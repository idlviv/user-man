import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

import { DatabaseError } from '../errors';
import { Config } from '../config';
import { UserHelper } from '../user';
import { injector } from '../injector';
// import { Mongoose } from './mongoose';

export class Passport {
  constructor() {
    this.passport = require('passport');
    this.userHelper = injector.get(UserHelper);
    this._config = injector.get(Config);
    // this.mongoose = injector.get(Mongoose);
  }

  config() {
    const UserModel = this._config.get.mongoose.models.users;
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
          this.userHelper.isLoginExists(userCandidate.login)
              .then((userFromDb) => {
                user = userFromDb;
                return this.userHelper.isPasswordLocked(userFromDb);
              })
          // if password doesn't match then throw error with code 'wrongCredentials' here
              .then((userFromDb) => {
                return this.userHelper.isPasswordMatched(userCandidate.password, userFromDb._doc.password, userFromDb);
              }
              )
              .then((userFromDb) => {
                return done(null, userFromDb);
              })
              .catch((err) => {
                if (err.code === 'wrongCredentials') {
                  this.userHelper.updatePasswordLockOptions(user)
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
          this.userHelper.isLoginExists(login)
              .then((userFromDb) => {
                done(null, userFromDb);
              })
              .catch((err) => done(err, false));
        }
    ));

    // google sign in strategy
    if (this._config.get.googleSignin) {
      this.passport.use(
          new GoogleStrategy(
              {
                clientID: this._config.get.googleClientID,
                clientSecret: this._config.get.googleClientSecret,
                callbackURL: this._config.get.googleCallbackURL + '/api/user/auth/google/redirect',
                userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
              },
              (accessToken, refreshToken, profile, done) => {
                // extract 'account' email
                console.log('profile', profile);
                // let email;
                // for (let i = 0; i < profile.emails.length; i++) {
                //   if (profile.emails[i].type === 'account') {
                //     email = profile.emails[i].value;
                //     break;
                //   }
                // }
                UserModel.findOne({ providersId: profile._json.sub })
                    .then((user) => {
                      if (user) {
                        // if user is already in db update credentials
                        return user.set({
                          avatar: profile._json.picture,
                          name: profile._json.given_name,
                          surname: profile._json.family_name,
                          accessToken,
                        }).save();
                      } else {
                        // if new user, create new record in db
                        return new UserModel({
                          provider: 'google',
                          login: 'gid_' + profile._json.sub,
                          email: profile._json.email,
                          avatar: profile._json.picture,
                          name: profile._json.given_name,
                          surname: profile._json.family_name,
                          role: 'google',
                          ban: 0,
                          createdAt: Date.now(),
                          commentsReadedTill: Date.now(),
                          providersId: profile._json.sub,
                          accessToken,
                          refreshToken,
                        }).save();
                      }
                    })
                    .then((user) => {
                      return done(null, user);
                    })
                    .catch((err) => done(new DatabaseError(err), false));
              }
          ));
    }


    const jwtOptions = {};
    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    jwtOptions.secretOrKey = this._config.get.JWTSecret;

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
    emailVerificationOptions.secretOrKey = this._config.get.JWTEmail;

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
    jwtOptionsPasswordResetCheckCode.secretOrKey = this._config.get.JWTSecretCode;
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
    jwtOptionsPasswordReset.secretOrKey = this._config.get.JWTSecretChangePassword;

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

// export const passport = new Passport();

