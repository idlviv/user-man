"use strict";

var _errors = require("../errors");

var _config = require("../config");

var passport = require('passport');

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var LocalStrategy = require('passport-local').Strategy;

var JwtStrategy = require('passport-jwt').Strategy;

var ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function () {};