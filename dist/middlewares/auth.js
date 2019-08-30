"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Auth = void 0;

var _errors = require("../errors");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Auth =
/*#__PURE__*/
function () {
  function Auth(permissions) {
    _classCallCheck(this, Auth);

    this.permissions = permissions;
  }

  _createClass(Auth, [{
    key: "authentication",
    value: function authentication(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      } else {
        return next(new _errors.ClientError({
          message: 'notAuthenticated',
          status: 401
        }));
      }
    }
  }, {
    key: "authorization",
    value: function authorization(restrictedRole) {
      var that = this;
      return function (req, res, next) {
        var usersRole = req.user._doc.role;
        var permissions = that.permissions;

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
  }]);

  return Auth;
}();

exports.Auth = Auth;