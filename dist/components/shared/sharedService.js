"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedService = void 0;

var jwt = _interopRequireWildcard(require("jsonwebtoken"));

var _config = require("../../config");

var _errors = require("../../errors");

var _libs = require("../../libs");

var _injector = require("../../injector");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SharedService =
/*#__PURE__*/
function () {
  function SharedService() {
    _classCallCheck(this, SharedService);

    this.jwt = jwt;
    this.config = _injector.injector.get(_config.Config);
    this.libs = _injector.injector.get(_libs.Libs);
  }
  /**
   * Create JWT token
   *
   * @param {string} prefix - prefix for token
   * @param {object} sub - subject payload
   * @param {number} expire - seconds
   * @param {string} secret - secret key from environment variables
   * @return {string}
   */


  _createClass(SharedService, [{
    key: "createJWT",
    value: function createJWT(prefix, sub, expire, secret) {
      var date = Math.floor(Date.now() / 1000); // in seconds

      return prefix + this.jwt.sign({
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
      var UserModel = this.config.get.mongoose.models.users;
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
      var transporter = this.libs.emailTransporter;
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