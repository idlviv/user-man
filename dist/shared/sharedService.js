"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedService = void 0;

var _config = require("../config");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs');

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
  }, {
    key: "updateDocument",

    /**
    * Wrapper for Mongo updateOne
    *
    * @param {*} filter
    * @param {*} update
    * @param {*} options
    * @return {Promise<object>}
    */
    value: function updateDocument(filter, update, options) {
      var UserModel = _config.config.get.UserModel;
      return new Promise(function (resolve, reject) {
        UserModel.updateOne(filter, update, options).then(function (result) {
          if (result.ok !== 1) {
            reject(new DbError());
          }

          resolve(result);
        }, function (err) {
          return reject(new DbError());
        });
      });
    }
  }, {
    key: "isPasswordMatched",

    /**
    * compare password from request (candidate)
    * with password from db
    *
    * @param {string} passwordCandidate
    * @param {string} passwordFromDb
    * @param {UserModel} userFromDb // added to pass user data on next step
    * @return {Promise<UserModel>}
    */
    value: function isPasswordMatched(passwordCandidate, passwordFromDb, userFromDb) {
      console.log('');
      return new Promise(function (resolve, reject) {
        bcrypt.compare(passwordCandidate, passwordFromDb).then(function (passwordMatched) {
          if (passwordMatched) {
            resolve(userFromDb);
          } else {
            reject(new ClientError({
              message: 'Невірний пароль',
              status: 401,
              code: 'wrongCredentials'
            }));
          }
        })["catch"](function (err) {
          return reject(err);
        });
      });
    }
  }]);

  return SharedService;
}();

exports.SharedService = SharedService;