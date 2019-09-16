"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "config", {
  enumerable: true,
  get: function get() {
    return _config.config;
  }
});
exports.user = exports.errors = exports.shared = void 0;

var _config = require("./config");

var shared = _interopRequireWildcard(require("./shared"));

exports.shared = shared;

var errors = _interopRequireWildcard(require("./errors"));

exports.errors = errors;

var user = _interopRequireWildcard(require("./user"));

exports.user = user;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }