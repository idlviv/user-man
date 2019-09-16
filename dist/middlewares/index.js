"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recaptcha = exports.auth = void 0;

var _auth = require("./auth");

var _recaptcha = require("./recaptcha");

// import { Cookie } from './cookie';
// import { User } from './user';
// factories
var auth = new _auth.Auth();
exports.auth = auth;
var recaptcha = new _recaptcha.Recaptcha(); // export const cookie = new Cookie();
// export const user = new User();

exports.recaptcha = recaptcha;