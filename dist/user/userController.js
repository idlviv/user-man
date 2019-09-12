"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserController = void 0;

var _errors = require("../errors");

var _config = require("../config");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UserController =
/*#__PURE__*/
function () {
  function UserController() {
    _classCallCheck(this, UserController);
  }

  _createClass(UserController, [{
    key: "create",
    value: function create() {
      var _this = this;

      return function (req, res, next) {
        var user = Object.assign({}, req.body);
        user.provider = 'local';

        _this.constructor.isEmailUnique(user.email, user.provider).then(function () {
          return next();
        })["catch"](function (err) {
          return next(err);
        }); // uHelper.isEmailUnique(user.email, user.provider)
        //     .then(() => userHelper.isLoginUnique(user.login))
        //     .then(() => bcrypt.hash(req.body.password, 10))
        //     .then((hash) => {
        //       user.password = hash;
        //       user.role = 'guest';
        //       user.createdAt = Date.now();
        //       user.commentsReadedTill = Date.now();
        //       const userModel = new UserModel(user);
        //       // create new user
        //       return userModel.save();
        //     })
        // // next to login created user
        //     .then(() => next())
        // // .catch((err) => next(new ClientError({ message: 'Помилка унікальності', status: 422, code: 'uniqueConflict' })));
        //     .catch((err) => next(err));

      };
    }
  }], [{
    key: "isEmailUnique",
    value: function isEmailUnique(email, provider) {
      var UserModel = _config.config.get.UserModel;
      return new Promise(function (resolve, reject) {
        UserModel.find({
          email: email,
          provider: provider
        }).then(function (result) {
          if (!result.length) {
            resolve();
          } else {
            reject(new _errors.ClientError({
              message: 'Цей email вже використовується',
              status: 422,
              code: 'uniqueConflict'
            }));
          }
        })["catch"](function (err) {
          return reject(new _errors.DbError());
        });
      });
    }
  }]);

  return UserController;
}(); // UserController.UserModel = config.get.UserModel;


exports.UserController = UserController;