"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedMiddleware = void 0;

var _errors = require("../errors");

var _config = require("../config");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var rp = require('request-promise-native');

var SharedMiddleware =
/*#__PURE__*/
function () {
  function SharedMiddleware() {
    _classCallCheck(this, SharedMiddleware);
  }

  _createClass(SharedMiddleware, [{
    key: "recaptcha",
    value: function recaptcha() {
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
  }]);

  return SharedMiddleware;
}();

exports.SharedMiddleware = SharedMiddleware;