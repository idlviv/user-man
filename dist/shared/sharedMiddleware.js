"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedMiddleware = void 0;

var _errors = require("../errors");

var _config = require("../config");

var _ = require("./");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// import * as rp from 'request-promise-native';
var rp = require('request-promise-native');

var SharedMiddleware =
/*#__PURE__*/
function () {
  function SharedMiddleware() {
    _classCallCheck(this, SharedMiddleware);

    this.rp = rp;
    this.sharedService = _.sharedService;
  }

  _createClass(SharedMiddleware, [{
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

        var recaptchaSecret = _config.config.get.recaptchaSecret;
        var recaptchaURL = "https://www.google.com/recaptcha/api/siteverify?secret=\n          ".concat(recaptchaSecret, "&response=").concat(recaptcha, "&\n          remoteip=").concat(req.connection.remoteAddress);

        _this.rp(recaptchaURL).then(function (result) {
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
      return function (req, res, next) {
        var usersRole = req.user._doc.role;
        var permissions = _config.config.get.permissions;

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
      return function (req, res, next) {
        var roleFromSession;

        if (req.isAuthenticated()) {
          roleFromSession = req.user._doc.role || 'casual';
        } else {
          roleFromSession = 'casual';
        }

        var requiredRoleForAuthorization = req.query.role;
        var permissions = _config.config.get.permissions;

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
      return function (req, res, next) {
        var cookieCsrfOptions = _config.config.get.cookieCsrfOptions;
        res.cookie('XSRF-TOKEN', req.csrfToken(), cookieCsrfOptions);
        next();
      };
    }
  }, {
    key: "sendFeedbackMessage",
    value: function sendFeedbackMessage() {
      var _this2 = this;

      return function (req, res, next) {
        var mailOptions = _config.config.get.mailOptionsQuestionFromSite;
        var feedback = {};
        Object.assign(feedback, req.body);
        mailOptions.subject = req.isAuthenticated() ? mailOptions.subject + ' від користувача [login:] ' + req.user._doc.login : mailOptions.subject;
        mailOptions.text = mailOptions.text.call(feedback).content;
        mailOptions.html = mailOptions.html.call(feedback).content;

        _this2.sharedService.sendMail(mailOptions).then(function () {
          return res.status(200).json('Повідомлення надіслано.');
        })["catch"](function (err) {
          return next(err);
        }); // let mailOptions = {
        //   from: 'HMade <questionfromsite@hmade.work>',
        //   to: 'info@hmade.work',
        //   subject: 'Питання з сайту',
        //   text: 'Питання ${feedback.message}. Контакти ${feedback.contacts}. Ім\'я ${feedback.name}',
        //   html: '<p><span style="font-weight: bold;">Питання: </span>' +
        //     feedback.message + '</p>' +
        //     '<p><span style="font-weight: bold">Контакти: </span>' +
        //     feedback.contacts + '</p>' +
        //     '<p><span style="font-weight: bold">Ім\'я: </span>' +
        //     feedback.name + '</p>',
        // };
        // transporter.sendMail(mailOptions, (err, info) => {
        //   if (err) {
        //     return next(new ApplicationError(err.message, err.status));
        //   }
        //   return res.status(200).json(new ResObj(true, 'Повідомлення надіслано'));
        // });

      };
    }
  }]);

  return SharedMiddleware;
}();

exports.SharedMiddleware = SharedMiddleware;