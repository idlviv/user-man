"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.User = void 0;

var _helpers = require("../helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var User =
/*#__PURE__*/
function () {
  function User() {
    _classCallCheck(this, User);

    this.userHelper = (0, _helpers.userHelper)();
  }

  _createClass(User, [{
    key: "create",
    value: function create() {
      var _this = this;

      return function (req, res, next) {
        var user = Object.assign({}, req.body);
        user.provider = 'local';
        console.log('this.userHelper', _this.userHelper);

        _this.userHelper.isEmailUnique(user.email, user.provider).then(function (par) {
          console.log('par', par);
          next();
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
  }]);

  return User;
}();

exports.User = User;