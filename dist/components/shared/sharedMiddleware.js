"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedMiddleware = void 0;

var _errors = require("../../errors");

var _config = require("../../config");

var _ = require("./");

var _injector = require("../../injector");

var _passport = require("../../libs/passport");

var _mongoose = require("../../libs/mongoose");

var _expressSession = _interopRequireDefault(require("express-session"));

var _cors = _interopRequireDefault(require("cors"));

var _csurf = _interopRequireDefault(require("csurf"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var rp = require('request-promise-native');

var MongoStore = require('connect-mongo')(_expressSession["default"]);

var SharedMiddleware =
/*#__PURE__*/
function () {
  function SharedMiddleware() {
    _classCallCheck(this, SharedMiddleware);

    // this.rp = rp;
    this.session = _expressSession["default"]; // console.log('session', this.session);

    this.cors = _cors["default"];
    this.csrf = _csurf["default"];
    this.sharedService = _injector.injector.get(_.SharedService);
    this.config = _injector.injector.get(_config.Config);
    this.passport = _injector.injector.get(_passport.Passport).get;
    this.mongoose = _injector.injector.get(_mongoose.Mongoose);
  }
  /**
   * all middlewates that should be inserted in express
   *
   * @return {Array} // array of middlewares
   * @memberof SharedMiddleware
   */


  _createClass(SharedMiddleware, [{
    key: "userManInit",
    value: function userManInit() {
      return [this.sessionCookie(), this.passport.initialize(), this.passport.session(), // this.setCors(),
      this.csrf({
        cookie: true
      }), // check cookie, add req.csrfToken(),
      this.setCSRFCookie(), // set custom cookie name (XSRF-TOKEN) for angular
      this.setFrontendAuthCookie() // set frontend authentication cookie
      // (req, res, next) => {
      //   console.log('init');
      //   next();
      // },
      ];
    }
  }, {
    key: "setCors",
    value: function setCors() {
      var corsOptions = {
        origin: 'https://use.fontawesome.com',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204

      };
      return this.cors(corsOptions);
    }
  }, {
    key: "sessionCookie",
    value: function sessionCookie() {
      var sessionStore = new MongoStore({
        mongooseConnection: this.mongoose.get.connection
      });
      var _this$config$get = this.config.get,
          sessionCookieKey = _this$config$get.sessionCookieKey,
          sessionCookieSecret = _this$config$get.sessionCookieSecret;
      return this.session({
        key: sessionCookieKey,
        secret: sessionCookieSecret,
        resave: true,
        saveUninitialized: true,
        cookie: {
          path: '/',
          httpOnly: true,
          // not reachable for js (XSS)
          // secure: config.get('NODE_ENV') === 'production',
          sameSite: 'Lax' // maxAge: null, // never expires, but will be deleted after closing browser

        },
        store: sessionStore
      });
    }
  }, {
    key: "recaptcha",
    value: function recaptcha() {
      var _this = this;

      return function (req, res, next) {
        var recaptcha = req.query.recaptcha;

        if (recaptcha === '' || recaptcha === null || recaptcha === undefined) {
          return next(new _errors.ClientError({
            message: 'Помилка коду recaptcha',
            status: 403,
            code: 'recaptchaErr'
          }));
        }

        var recaptchaSecret = _this.config.get.recaptchaSecret;
        var recaptchaURL = "https://www.google.com/recaptcha/api/siteverify?secret=\n          ".concat(recaptchaSecret, "&response=").concat(recaptcha, "&\n          remoteip=").concat(req.connection.remoteAddress);
        rp(recaptchaURL).then(function (result) {
          result = JSON.parse(result);

          if (result.success === true) {
            return next();
          } else {
            return next(new _errors.ClientError({
              message: 'Помилка коду recaptcha',
              status: 403,
              code: 'recaptchaErr'
            }));
          }
        })["catch"](function (err) {
          return next(new _errors.ClientError({
            message: 'Помилка коду recaptcha',
            status: 403,
            code: 'recaptchaErr'
          }));
        });
      };
    }
    /**
     * Pass next() if client is authenticated otherwise next(err)
     *
     * @return {Function} next
     */

  }, {
    key: "authentication",
    value: function authentication() {
      return function (req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        } else {
          return next(new _errors.ClientError({
            message: 'notAuthenticated',
            status: 401
          }));
        }
      };
    }
    /**
     * Pass next() if client is authorized
     * (his role allowed according to permissions)
     * otherwise next(err)
     *
     * @param {String} restrictedRole
     * @return {Function} next
     */

  }, {
    key: "authorization",
    value: function authorization(restrictedRole) {
      var _this2 = this;

      return function (req, res, next) {
        var usersRole = req.user._doc.role;
        var permissions = _this2.config.get.permissions;

        if (usersRole in permissions) {
          if (permissions[usersRole].indexOf(restrictedRole) >= 0) {
            return next();
          } else {
            return next(new _errors.ClientError({
              message: 'notAuthorized',
              status: 401
            }));
          }
        } else {
          return next(new _errors.ClientError({
            message: 'notAuthorized',
            status: 401
          }));
        }
      };
    }
    /**
     * Used for frontend router guard (canActivate)
     *
     * @return {Boolean}
     */

  }, {
    key: "checkAuthorization",
    value: function checkAuthorization() {
      var _this3 = this;

      return function (req, res, next) {
        var roleFromSession;

        if (req.isAuthenticated()) {
          roleFromSession = req.user._doc.role || 'casual';
        } else {
          roleFromSession = 'casual';
        }

        var requiredRoleForAuthorization = req.query.role;
        var permissions = _this3.config.get.permissions;

        if (permissions[roleFromSession].indexOf(requiredRoleForAuthorization) >= 0) {
          return res.status(200).json(true);
        } else {
          return res.status(200).json(false);
        }
      };
    }
  }, {
    key: "setCSRFCookie",
    value: function setCSRFCookie() {
      var _this4 = this;

      return function (req, res, next) {
        var cookieCsrfOptions = _this4.config.get.cookieCsrfOptions;
        res.cookie('XSRF-TOKEN', req.csrfToken(), cookieCsrfOptions);
        next();
      };
    }
    /*
     set cookie to frontend with users credential
    */

  }, {
    key: "setFrontendAuthCookie",
    value: function setFrontendAuthCookie() {
      var _this5 = this;

      return function (req, res, next) {
        var _this5$config$get = _this5.config.get,
            JWTSecret = _this5$config$get.JWTSecret,
            frontendCookieName = _this5$config$get.frontendCookieName;
        var token;

        if (req.isAuthenticated()) {
          var user = {
            _id: req.user._doc._id,
            login: req.user._doc.login,
            name: req.user._doc.name,
            surname: req.user._doc.surname,
            avatar: req.user._doc.avatar,
            provider: req.user._doc.provider,
            role: req.user._doc.role,
            commentsReadedTill: req.user._doc.commentsReadedTill
          };
          token = _this5.sharedService.createJWT('', user, null, JWTSecret);
        } else {
          token = _this5.sharedService.createJWT('', null, null, JWTSecret);
        }

        res.cookie(frontendCookieName, token, {
          // 'secure': false,
          httpOnly: false,
          // maxAge: null,
          sameSite: 'Strict'
        });
        next();
      };
    }
  }, {
    key: "sendFeedbackMessage",
    value: function sendFeedbackMessage() {
      var _this6 = this;

      return function (req, res, next) {
        var mailOptions = _this6.config.get.mailOptionsQuestionFromSite;
        var feedback = {};
        Object.assign(feedback, req.body);
        mailOptions.subject = req.isAuthenticated() ? mailOptions.subject + ' від користувача [login:] ' + req.user._doc.login : mailOptions.subject;
        mailOptions.text = mailOptions.text.call(feedback).content;
        mailOptions.html = mailOptions.html.call(feedback).content;

        _this6.sharedService.sendMail(mailOptions).then(function () {
          return res.status(200).json('Повідомлення надіслано.');
        })["catch"](function (err) {
          return next(err);
        });
      };
    }
  }]);

  return SharedMiddleware;
}();

exports.SharedMiddleware = SharedMiddleware;