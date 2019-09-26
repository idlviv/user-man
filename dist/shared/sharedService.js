"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedService = void 0;

var _config = require("../config");

var _errors = require("../errors");

var _libs = require("../libs");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var jwt = require('jsonwebtoken');

var SharedService =
/*#__PURE__*/
function () {
  function SharedService() {
    _classCallCheck(this, SharedService);
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


  _createClass(SharedService, [{
    key: "createJWT",
    value: function createJWT(prefix, sub, expire, secret) {
      var date = Math.floor(Date.now() / 1000); // in seconds

      return prefix + jwt.sign({
        sub: sub,
        iat: date,
        exp: date + expire
      }, secret);
    }
    /**
     * Wrapper for Mongo updateOne
     *
     * @param {*} filter
     * @param {*} update
     * @param {*} options
     * @return {Promise<object>}
     */

  }, {
    key: "updateDocument",
    value: function updateDocument(filter, update, options) {
      var UserModel = _config.config.get.UserModel;
      return new Promise(function (resolve, reject) {
        UserModel.updateOne(filter, update, options).then(function (result) {
          if (result.ok !== 1) {
            reject(new _errors.DbError());
          }

          resolve(result);
        }, function (err) {
          return reject(new _errors.DbError());
        });
      });
    }
    /**
     * Send mail
     *
     * @param {Object} mailOptions
     * @return {Promise}
     */

  }, {
    key: "sendMail",
    value: function sendMail(mailOptions) {
      var transporter = _libs.libs.emailTransporter;
      return new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            reject(new _errors.ServerError({
              message: 'Помилка відправки email'
            }));
          }

          resolve(info);
        });
      });
    }
  }]);

  return SharedService;
}();

exports.SharedService = SharedService;