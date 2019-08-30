"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cookie = void 0;

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
    value: function setUserCookie(req, res, next) {
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
        token = createJWT('', user, null, 'JWT_SECRET');
      } else {
        token = createJWT('', null, null, 'JWT_SECRET');
      }

      res.cookie('hmade', token, {
        // 'secure': false,
        httpOnly: false,
        // 'maxAge': null,
        sameSite: 'Strict'
      });
      next();
    }
  }]);

  return Cookie;
}();

exports.Cookie = Cookie;