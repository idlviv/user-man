const { cryptHelper } = require('./dist').helpers;
const { auth, recaptcha, cookie } = require('./dist').middlewares;
const { ClientError, ServerError } = require('./dist').errors;
const { userController } = require('./dist').userModule;
const config = require('./dist/config').config;
const Config = require('./dist/config').Config;

module.exports = {
  config,
  Config,
  cryptHelper,
  cookie,
  auth,
  recaptcha,
  ClientError,
  ServerError,
  userController,
};
