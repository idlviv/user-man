"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Passport = void 0;

var _passportGoogleOauth = require("passport-google-oauth");

var _passportLocal = require("passport-local");

var _passportJwt = require("passport-jwt");

var _errors = require("../errors");

var _config = require("../config");

var _user = require("../user");

var _injector = require("../injector");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var passport = require('passport');

var Passport =
/*#__PURE__*/
function () {
  function Passport() {
    _classCallCheck(this, Passport);

    this.passport = passport;
    this.userHelper = _injector.injector.get(_user.UserHelper);
    this._config = _injector.injector.get(_config.Config); // this.mongoose = injector.get(Mongoose);
  }

  _createClass(Passport, [{
    key: "config",
    value: function config() {
      var _this = this;

      var UserModel = this._config.get.mongoose.models.users;
      this.passport.serializeUser(function (user, done) {
        return done(null, user._id);
      });
      this.passport.deserializeUser(function (_id, done) {
        UserModel.findById(_id).then(function (user) {
          return done(null, user);
        }, function (err) {
          return done(err, false);
        });
      }); // login user with password

      this.passport.use('local', new _passportLocal.Strategy({
        usernameField: 'login',
        passwordField: 'password'
      }, function (login, password, done) {
        var userCandidate = {
          login: login,
          password: password
        };
        var user;

        _this.userHelper.isLoginExists(userCandidate.login).then(function (userFromDb) {
          user = userFromDb;
          return _this.userHelper.isPasswordLocked(userFromDb);
        }) // if password doesn't match then throw error with code 'wrongCredentials' here
        .then(function (userFromDb) {
          return _this.userHelper.isPasswordMatched(userCandidate.password, userFromDb._doc.password, userFromDb);
        }).then(function (userFromDb) {
          return done(null, userFromDb);
        })["catch"](function (err) {
          if (err.code === 'wrongCredentials') {
            _this.userHelper.updatePasswordLockOptions(user).then(function () {
              return done(err, false);
            });
          } else {
            done(err, false);
          }
        });
      })); // login user after creation or change credentials
      // without password

      this.passport.use('localWithoutPassword', new _passportLocal.Strategy({
        usernameField: 'login'
      }, function (login, password, done) {
        _this.userHelper.isLoginExists(login).then(function (userFromDb) {
          done(null, userFromDb);
        })["catch"](function (err) {
          return done(err, false);
        });
      })); // google sign in strategy

      if (this._config.get.googleSignin) {
        this.passport.use(new _passportGoogleOauth.OAuth2Strategy({
          clientID: this._config.get.googleClientID,
          clientSecret: this._config.get.googleClientSecret,
          callbackURL: this._config.get.googleCallbackURL + '/api/user/auth/google/redirect',
          userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
        }, function (accessToken, refreshToken, profile, done) {
          // extract 'account' email
          console.log('profile', profile); // let email;
          // for (let i = 0; i < profile.emails.length; i++) {
          //   if (profile.emails[i].type === 'account') {
          //     email = profile.emails[i].value;
          //     break;
          //   }
          // }

          UserModel.findOne({
            providersId: profile._json.sub
          }).then(function (user) {
            if (user) {
              // if user is already in db update credentials
              return user.set({
                avatar: profile._json.picture,
                name: profile._json.given_name,
                surname: profile._json.family_name,
                accessToken: accessToken
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
                accessToken: accessToken,
                refreshToken: refreshToken
              }).save();
            }
          }).then(function (user) {
            return done(null, user);
          })["catch"](function (err) {
            return done(new _errors.DatabaseError(err), false);
          });
        }));
      }

      var jwtOptions = {};
      jwtOptions.jwtFromRequest = _passportJwt.ExtractJwt.fromAuthHeaderWithScheme('jwt');
      jwtOptions.secretOrKey = this._config.get.JWTSecret;
      this.passport.use('jwt', new _passportJwt.Strategy(jwtOptions, function (jwtPayload, done) {
        // на основі _id (витягнутого з токена) робить пошук
        // в базі, чи є такий юзер, і ф-я done повертає відповідь
        UserModel.findOne({
          _id: jwtPayload.sub._id
        }).then(function (user) {
          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        })["catch"](function (err) {
          done(err, false);
        });
      }));
      var emailVerificationOptions = {};
      emailVerificationOptions.jwtFromRequest = _passportJwt.ExtractJwt.fromUrlQueryParameter('token');
      emailVerificationOptions.secretOrKey = this._config.get.JWTEmail; // pass req object to callback as first argument

      emailVerificationOptions.passReqToCallback = true;
      this.passport.use('jwt.email.verification', new _passportJwt.Strategy(emailVerificationOptions, function (req, jwtPayload, done) {
        // check that user which logged in is the same that user who veryfing email
        if (req.user._doc._id.toString() === jwtPayload.sub._id.toString()) {
          UserModel.findOne({
            _id: jwtPayload.sub._id
          }).then(function (user) {
            if (user) {
              done(null, user);
            } else {
              done(null, false);
            }
          })["catch"](function (err) {
            done(err, false);
          });
        } else {
          done(null, false);
        }
      }));
      var jwtOptionsPasswordResetCheckCode = {};
      jwtOptionsPasswordResetCheckCode.jwtFromRequest = _passportJwt.ExtractJwt.fromAuthHeaderWithScheme('jwt');
      jwtOptionsPasswordResetCheckCode.secretOrKey = this._config.get.JWTSecretCode; // extract _id from token to identify user, which resets password

      this.passport.use('jwt.passwordResetCheckCode', new _passportJwt.Strategy(jwtOptionsPasswordResetCheckCode, function (jwtPayload, done) {
        UserModel.findOne({
          _id: jwtPayload.sub._id
        }).then(function (user) {
          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        })["catch"](function (err) {
          done(err, false);
        });
      }));
      var jwtOptionsPasswordReset = {};
      jwtOptionsPasswordReset.jwtFromRequest = _passportJwt.ExtractJwt.fromAuthHeaderWithScheme('jwt');
      jwtOptionsPasswordReset.secretOrKey = this._config.get.JWTSecretChangePassword;
      this.passport.use('jwt.passwordReset', new _passportJwt.Strategy(jwtOptionsPasswordReset, function (jwtPayload, done) {
        UserModel.findOne({
          _id: jwtPayload.sub._id
        }).then(function (user) {
          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        })["catch"](function (err) {
          done(err, false);
        });
      }));
    }
  }, {
    key: "get",
    get: function get() {
      return this.passport;
    }
  }]);

  return Passport;
}(); // export const passport = new Passport();


exports.Passport = Passport;