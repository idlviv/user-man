"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = void 0;

var _errors = require("./errors");

var _userService = require("./user/userService");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var nodemailer = require('nodemailer');

var passport = require('passport');

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var LocalStrategy = require('passport-local').Strategy;

var JwtStrategy = require('passport-jwt').Strategy;

var ExtractJwt = require('passport-jwt').ExtractJwt;

var Config =
/*#__PURE__*/
function () {
  function Config() {
    _classCallCheck(this, Config);

    // make singleton
    if (Config.exists) {
      return Config.instance;
    }

    Config.instance = this;
    Config.exists = true; // initialization

    this.options = {};
    this.userService = _userService.userService;
  }

  _createClass(Config, [{
    key: "getOptions",
    value: function getOptions() {
      return this.options;
    }
  }, {
    key: "init",
    value: function init(options) {
      this.options = options;
    }
  }, {
    key: "get",
    get: function get() {
      return this.options;
    }
  }, {
    key: "emailTransporter",
    get: function get() {
      return nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: this.get.emailUser,
          pass: this.get.emailPassword
        }
      });
    }
  }, {
    key: "passport",
    get: function get() {
      var _this = this;

      var UserModel = this.get.UserModel;
      passport.serializeUser(function (user, done) {
        return done(null, user._id);
      });
      passport.deserializeUser(function (_id, done) {
        UserModel.findById(_id).then(function (user) {
          return done(null, user);
        }, function (err) {
          return done(err, false);
        });
      }); // login user with password

      passport.use('local', new LocalStrategy({
        usernameField: 'login',
        passwordField: 'password'
      }, function (login, password, done) {
        var userCandidate = {
          login: login,
          password: password
        };
        var user;

        _this.userService.isLoginExists(userCandidate.login).then(function (userFromDb) {
          user = userFromDb;
          console.log('userFromDb 0', userFromDb);
          return _this.userService.isPasswordLocked(userFromDb);
        }) // if password doesn't match then throw error with code 'wrongCredentials' here
        .then(function (userFromDb) {
          console.log('userFromDb 0', userFromDb);
          return _this.userService.isPasswordMatched(userCandidate.password, userFromDb._doc.password, userFromDb);
        }).then(function (userFromDb) {
          console.log('userFromDb', userFromDb);
          return done(null, userFromDb);
        })["catch"](function (err) {
          if (err.code === 'wrongCredentials') {
            _this.userService.updatePasswordLockOptions(user).then(function () {
              return done(err, false);
            });
          } else {
            done(err, false);
          }
        });
      })); // login user after creation or change credentials
      // without password

      passport.use('localWithoutPassword', new LocalStrategy({
        usernameField: 'login'
      }, function (login, password, done) {
        _this.userService.isLoginExists(login).then(function (userFromDb) {
          done(null, userFromDb);
        })["catch"](function (err) {
          return done(err, false);
        });
      })); // console.log('config.get.googleClientID', config.get.googleClientID);
      // google sign in strategy

      passport.use(new GoogleStrategy({
        clientID: this.get.googleClientID,
        clientSecret: this.get.googleClientSecret,
        callbackURL: this.get.googleCallbackURL + '/api/user/auth/google/redirect'
      }, function (accessToken, refreshToken, profile, done) {
        // extract 'account' email
        var email;

        for (var i = 0; i < profile.emails.length; i++) {
          if (profile.emails[i].type === 'account') {
            email = profile.emails[i].value;
            break;
          }
        }

        UserModel.findOne({
          providersId: profile.id
        }).then(function (user) {
          if (user) {
            // if user is already in db update credentials
            return user.set({
              avatar: profile._json.image.url,
              name: profile._json.name.givenName,
              surname: profile._json.name.familyName,
              accessToken: accessToken
            }).save();
          } else {
            // if new user, create new record in db
            return new UserModel({
              provider: 'google',
              login: 'gid_' + profile._json.id,
              email: email,
              avatar: profile._json.image.url,
              name: profile._json.name.givenName,
              surname: profile._json.name.familyName,
              role: 'google',
              ban: 0,
              createdAt: Date.now(),
              commentsReadedTill: Date.now(),
              providersId: profile._json.id,
              accessToken: accessToken,
              refreshToken: refreshToken
            }).save();
          }
        }).then(function (user) {
          return done(null, user);
        })["catch"](function (err) {
          return done(new _errors.DbError(err), false);
        });
      }));
      var jwtOptions = {};
      jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
      jwtOptions.secretOrKey = this.get.JWTSecret;
      passport.use('jwt', new JwtStrategy(jwtOptions, function (jwtPayload, done) {
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
      emailVerificationOptions.secretOrKey = this.get.JWTEmail;
      passport.use('jwt.email.verification', new JwtStrategy(emailVerificationOptions, function (jwtPayload, done) {
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
      var jwtOptionsPasswordResetCheckCode = {};
      jwtOptionsPasswordResetCheckCode.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
      jwtOptionsPasswordResetCheckCode.secretOrKey = this.get.JWTSecretCode; // extract _id from token to identify user, which resets password

      passport.use('jwt.passwordResetCheckCode', new JwtStrategy(jwtOptionsPasswordResetCheckCode, function (jwtPayload, done) {
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
      jwtOptionsPasswordReset.secretOrKey = this.get.JWTSecretChangePassword;
      passport.use('jwt.passwordReset', new JwtStrategy(jwtOptionsPasswordReset, function (jwtPayload, done) {
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
      return passport;
    }
  }]);

  return Config;
}();

var config = new Config();
exports.config = config;