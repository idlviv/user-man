"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CryptHelper = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var jwt = require('jsonwebtoken');

var CryptHelper =
/*#__PURE__*/
function () {
  function CryptHelper() {
    _classCallCheck(this, CryptHelper);
  }
  /**
   * Create JWT token
   *
   * @param {string} prefix - prefix for token
   * @param {object} sub - subject payload
   * @param {number} expire - seconds
   * @param {string} secret - secret key from environment variables
   * @return {string}
   * @memberof CryptHelper
   */


  _createClass(CryptHelper, [{
    key: "createJWT",
    value: function createJWT(prefix, sub, expire, secret) {
      var date = Math.floor(Date.now() / 1000); // in seconds

      return prefix + jwt.sign({
        sub: sub,
        iat: date,
        exp: date + expire
      }, secret);
    }
  }]);

  return CryptHelper;
}();

exports.CryptHelper = CryptHelper;