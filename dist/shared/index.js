"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "SharedService", {
  enumerable: true,
  get: function get() {
    return _sharedService.SharedService;
  }
});
Object.defineProperty(exports, "SharedMiddleware", {
  enumerable: true,
  get: function get() {
    return _sharedMiddleware.SharedMiddleware;
  }
});
Object.defineProperty(exports, "UserRouter", {
  enumerable: true,
  get: function get() {
    return _userRouter.UserRouter;
  }
});
Object.defineProperty(exports, "CatalogRouter", {
  enumerable: true,
  get: function get() {
    return _catalogRouter.CatalogRouter;
  }
});
Object.defineProperty(exports, "DbRouter", {
  enumerable: true,
  get: function get() {
    return _dbRouter.DbRouter;
  }
});

var _sharedService = require("./sharedService");

var _sharedMiddleware = require("./sharedMiddleware");

var _userRouter = require("./routes/userRouter");

var _catalogRouter = require("./routes/catalogRouter");

var _dbRouter = require("./routes/dbRouter");