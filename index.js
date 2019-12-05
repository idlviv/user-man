const { ClientError, ServerError, DbError } = require('./dist').errors;
const { libs, sharedMiddleware, sharedService} = require('./dist');
const { Config, UserRouter, CatalogRouter, DbRouter, Libs } = require('./dist');


module.exports = {
  userManInit() {
    // all middlewates that should be inserted in express
    return sharedMiddleware.userManInit();
  },
  libs, sharedMiddleware, sharedService,
  Libs,
  Config,
  ClientError, ServerError, DbError,
  UserRouter, CatalogRouter, DbRouter,
};
