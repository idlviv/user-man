"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "UserRouter", {
  enumerable: true,
  get: function get() {
    return _userRouter.UserRouter;
  }
});
exports.userController = void 0;

var _userController = require("./userController");

var _userRouter = require("./userRouter");

var userController = new _userController.UserController();
exports.userController = userController;