"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Libs = void 0;

var _passport = require("./passport");

var _config = require("../config");

var _mongoose = require("./mongoose");

var _injector = require("../injector");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var nodemailer = require('nodemailer');

var cloudinary = require('cloudinary');

var Libs =
/*#__PURE__*/
function () {
  function Libs() {
    _classCallCheck(this, Libs);

    this._config = _injector.injector.get(_config.Config);
    this._mongoose = _injector.injector.get(_mongoose.Mongoose);
    this._passport = _injector.injector.get(_passport.Passport);
    this._nodemailer = nodemailer;
    this._cloudinary = cloudinary;
  }

  _createClass(Libs, [{
    key: "config",
    value: function config() {
      // configure mongoose models
      this._mongoose.config(); // all libs that must be configured


      this._cloudinary.config({
        cloud_name: this._config.get.cloudinaryName,
        api_key: this._config.get.cloudinaryKey,
        api_secret: this._config.get.cloudinarySecret
      });

      this._passport.config();
    }
  }, {
    key: "emailTransporter",
    get: function get() {
      return this._nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: this._config.get.emailUser,
          pass: this._config.get.emailPassword
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
  }, {
    key: "mongoose",
    get: function get() {
      return this._mongoose.get;
    }
  }]);

  return Libs;
}(); // export const libs = new Libs();


exports.Libs = Libs;