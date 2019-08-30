"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.auth = auth;

var _auth = require("./auth");

// factory for auth middleware
function auth(permissions) {
  return new _auth.Auth(permissions);
}

;