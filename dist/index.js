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
exports.libs = exports.user = exports.errors = exports.shared = void 0;

var _config = require("./config");

var shared = _interopRequireWildcard(require("./shared"));

exports.shared = shared;

var errors = _interopRequireWildcard(require("./errors"));

exports.errors = errors;

var user = _interopRequireWildcard(require("./user"));

exports.user = user;

var libs = _interopRequireWildcard(require("./libs"));

exports.libs = libs;

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }