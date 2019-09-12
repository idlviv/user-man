"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cookie = exports.recaptcha = exports.auth = void 0;

var _auth = require("./auth");

var _recaptcha = require("./recaptcha");

var _cookie = require("./cookie");

// import { User } from './user';
// factories
var auth = new _auth.Auth();
exports.auth = auth;
var recaptcha = new _recaptcha.Recaptcha();
exports.recaptcha = recaptcha;
var cookie = new _cookie.Cookie(); // export const user = new User();

exports.cookie = cookie;