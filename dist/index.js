"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Config", {
  enumerable: true,
  get: function get() {
    return _config.Config;
  }
});
Object.defineProperty(exports, "Libs", {
  enumerable: true,
  get: function get() {
    return _libs.Libs;
  }
});
Object.defineProperty(exports, "UserRouter", {
  enumerable: true,
  get: function get() {
    return _shared.UserRouter;
  }
});
Object.defineProperty(exports, "CatalogRouter", {
  enumerable: true,
  get: function get() {
    return _shared.CatalogRouter;
  }
});
Object.defineProperty(exports, "DbRouter", {
  enumerable: true,
  get: function get() {
    return _shared.DbRouter;
  }
});
exports.helpers = exports.errors = exports.sharedService = exports.sharedMiddleware = exports.libs = void 0;

var _config = require("./config");

var _injector = require("./injector");

var errors = _interopRequireWildcard(require("./errors"));

exports.errors = errors;

var _libs = require("./libs");

var _shared = require("./shared");

var helpers = _interopRequireWildcard(require("./helpers"));

exports.helpers = helpers;

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var libs = _injector.injector.get(_libs.Libs);

exports.libs = libs;

var sharedMiddleware = _injector.injector.get(_shared.SharedMiddleware);

exports.sharedMiddleware = sharedMiddleware;

var sharedService = _injector.injector.get(_shared.SharedService);

exports.sharedService = sharedService;