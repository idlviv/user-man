const { sharedService, sharedMiddleware } = require('./dist').shared;
const { ClientError, ServerError, DbError } = require('./dist').errors;
const { userController, UserRouter} = require('./dist').user;
const { Libs, libs } = require('./dist').libs;
const { Config } = require('./dist');
// const { config, Config }= require('./dist');

module.exports = {
  // config,
  Config,
  sharedService,
  sharedMiddleware,
  ClientError,
  ServerError,
  DbError,
  userController,
  UserRouter,
  Libs,
  libs,
};
