const { sharedService, sharedMiddleware } = require('./dist').shared;
const { ClientError, ServerError, DbError } = require('./dist').errors;
const { userController, UserRouter } = require('./dist').user;
const config = require('./dist/config').config;

module.exports = {
  config,
  sharedService,
  sharedMiddleware,
  ClientError,
  ServerError,
  DbError,
  userController,
  UserRouter,
};
