"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var nodemailer = require('nodemailer');

var Config =
/*#__PURE__*/
function () {
  function Config() {
    _classCallCheck(this, Config);

    // make singleton
    if (Config.exists) {
      return Config.instance;
    }

    Config.instance = this;
    Config.exists = true; // initialization

    this.options = {};
  }

  _createClass(Config, [{
    key: "getOptions",
    value: function getOptions() {
      return this.options;
    }
  }, {
    key: "init",
    value: function init(options) {
      this.options = options;
    }
  }, {
    key: "get",
    get: function get() {
      return this.options;
    }
  }, {
    key: "emailTransporter",
    get: function get() {
      return nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: this.get.emailUser,
          pass: this.get.emailPassword
        }
      });
    }
  }]);

  return Config;
}();

var config = new Config();
exports.config = config;