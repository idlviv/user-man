"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.libs = void 0;

var _passport = require("./passport");

var _config2 = require("../config");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var nodemailer = require('nodemailer');

var cloudinary = require('cloudinary');

var util = require('util');

var Libs =
/*#__PURE__*/
function () {
  function Libs() {
    _classCallCheck(this, Libs);

    this._nodemailer = nodemailer;
    this._cloudinary = cloudinary;
    this._passport = _passport.passport;
  }

  _createClass(Libs, [{
    key: "config",
    value: function config() {
      // all libs that must be configured
      this._cloudinary.config({
        cloud_name: _config2.config.get.cloudinaryName,
        api_key: _config2.config.get.cloudinaryKey,
        api_secret: _config2.config.get.cloudinarySecret
      });

      this._passport.config();
    }
  }, {
    key: "emailTransporter",
    get: function get() {
      return this._nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: _config2.config.get.emailUser,
          pass: _config2.config.get.emailPassword
        }
      });
    }
  }, {
    key: "cloudinary",
    get: function get() {
      return this._cloudinary;
    }
  }, {
    key: "passport",
    get: function get() {
      return this._passport.get;
    }
  }]);

  return Libs;
}();

var libs = new Libs();
exports.libs = libs;