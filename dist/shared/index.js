"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sharedMiddleware = exports.sharedService = void 0;

var _sharedService = require("./sharedService");

var _sharedMiddleware = require("./sharedMiddleware");

var sharedService = new _sharedService.SharedService();
exports.sharedService = sharedService;
var sharedMiddleware = new _sharedMiddleware.SharedMiddleware();
exports.sharedMiddleware = sharedMiddleware;