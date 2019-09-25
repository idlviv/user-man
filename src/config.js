// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// const LocalStrategy = require('passport-local').Strategy;
// const JwtStrategy = require('passport-jwt').Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;
// import { DbError } from './errors';

class Config {
  constructor() {
    // make singleton
    if (Config.exists) {
      return Config.instance;
    }
    Config.instance = this;
    Config.exists = true;
    // initialization
    this.options = {};
  }

  get get() {
    return this.options;
  }

  init(options) {
    this.options = options;
  }
}

export const config = new Config();
