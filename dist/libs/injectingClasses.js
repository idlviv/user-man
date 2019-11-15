"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Injected = void 0;

var _helpers = require("../helpers");

var _shared = require("../shared");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Injected =
/*#__PURE__*/
function () {
  function Injected() {
    _classCallCheck(this, Injected);
  }

  _createClass(Injected, [{
    key: "config",
    value: function config() {}
  }]);

  return Injected;
}();

exports.Injected = Injected;