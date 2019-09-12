"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cookie = void 0;

var _helpers = require("../helpers");

var _config = require("../config");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Cookie =
/*#__PURE__*/
function () {
  function Cookie() {
    _classCallCheck(this, Cookie);
  }

  _createClass(Cookie, [{
    key: "setUserCookie",
    // setUserCookie({ JWTSecret, cookieName }) {
    value: function setUserCookie() {
      var _this = this;

      var _config$get = _config.config.get,
          JWTSecret = _config$get.JWTSecret,
          cookieName = _config$get.cookieName;
      return function (req, res, next) {
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
          token = _this.constructor.createJWT('', user, null, JWTSecret); // token = CookieHelper.createJWT('', user, null, JWTSecret);
        } else {
          token = _this.constructor.createJWT('', null, null, JWTSecret); // token = CookieHelper.createJWT('', null, null, JWTSecret);
        }

        res.cookie(cookieName, token, {
          // 'secure': false,
          httpOnly: false,
          // maxAge: null,
          sameSite: 'Strict'
        });
        next();
      };
    }
  }], [{
    key: "createJWT",
    value: function createJWT(prefix, sub, expire, secret) {
      return (0, _helpers.cryptHelper)().createJWT(prefix, sub, expire, secret);
    }
  }]);

  return Cookie;
}();

exports.Cookie = Cookie;