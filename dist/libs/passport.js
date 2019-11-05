"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.passport = exports.Passport = void 0;

var _errors = require("../errors");

var _userService = require("../user/userService");

var _config2 = require("../config");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var LocalStrategy = require('passport-local').Strategy;

var JwtStrategy = require('passport-jwt').Strategy;

var ExtractJwt = require('passport-jwt').ExtractJwt;

var Passport =
/*#__PURE__*/
function () {
  function Passport() {
    _classCallCheck(this, Passport);

    this.passport = require('passport');
  }

  _createClass(Passport, [{
    key: "config",
    value: function config() {
      var UserModel = _config2.config.get.UserModel;
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

      this.passport.use('local', new LocalStrategy({
        usernameField: 'login',
        passwordField: 'password'
      }, function (login, password, done) {
        var userCandidate = {
          login: login,
          password: password
        };
        var user;

        _userService.userService.isLoginExists(userCandidate.login).then(function (userFromDb) {
          user = userFromDb;
          return _userService.userService.isPasswordLocked(userFromDb);
        }) // if password doesn't match then throw error with code 'wrongCredentials' here
        .then(function (userFromDb) {
          return _userService.userService.isPasswordMatched(userCandidate.password, userFromDb._doc.password, userFromDb);
        }).then(function (userFromDb) {
          return done(null, userFromDb);
        })["catch"](function (err) {
          if (err.code === 'wrongCredentials') {
            _userService.userService.updatePasswordLockOptions(user).then(function () {
              return done(err, false);
            });
          } else {
            done(err, false);
          }
        });
      })); // login user after creation or change credentials
      // without password

      this.passport.use('localWithoutPassword', new LocalStrategy({
        usernameField: 'login'
      }, function (login, password, done) {
        _userService.userService.isLoginExists(login).then(function (userFromDb) {
          done(null, userFromDb);
        })["catch"](function (err) {
          return done(err, false);
        });
      })); // google sign in strategy

      this.passport.use(new GoogleStrategy({
        clientID: _config2.config.get.googleClientID,
        clientSecret: _config2.config.get.googleClientSecret,
        callbackURL: _config2.config.get.googleCallbackURL + '/api/user/auth/google/redirect',
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
      var jwtOptions = {};
      jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
      jwtOptions.secretOrKey = _config2.config.get.JWTSecret;
      this.passport.use('jwt', new JwtStrategy(jwtOptions, function (jwtPayload, done) {
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
      emailVerificationOptions.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('token');
      emailVerificationOptions.secretOrKey = _config2.config.get.JWTEmail; // pass req object to callback as first argument

      emailVerificationOptions.passReqToCallback = true;
      this.passport.use('jwt.email.verification', new JwtStrategy(emailVerificationOptions, function (req, jwtPayload, done) {
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
      jwtOptionsPasswordResetCheckCode.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
      jwtOptionsPasswordResetCheckCode.secretOrKey = _config2.config.get.JWTSecretCode; // extract _id from token to identify user, which resets password

      this.passport.use('jwt.passwordResetCheckCode', new JwtStrategy(jwtOptionsPasswordResetCheckCode, function (jwtPayload, done) {
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
      jwtOptionsPasswordReset.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
      jwtOptionsPasswordReset.secretOrKey = _config2.config.get.JWTSecretChangePassword;
      this.passport.use('jwt.passwordReset', new JwtStrategy(jwtOptionsPasswordReset, function (jwtPayload, done) {
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
}();

exports.Passport = Passport;
var passport = new Passport();
exports.passport = passport;