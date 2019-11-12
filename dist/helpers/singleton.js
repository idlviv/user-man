"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Singleton = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Singleton = function Singleton() {
  _classCallCheck(this, Singleton);

  if (this.constructor.exists) {
    return this.constructor.instance;
  }

  this.constructor.instance = this;
  this.constructor.exists = true;
};

exports.Singleton = Singleton;