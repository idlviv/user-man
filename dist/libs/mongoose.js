"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mongoose = void 0;

var _config2 = require("../config");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Mongoose =
/*#__PURE__*/
function () {
  function Mongoose() {
    _classCallCheck(this, Mongoose);
  }

  _createClass(Mongoose, [{
    key: "config",
    value: function config() {
      var _config$get = _config2.config.get,
          mongoose = _config$get.mongoose,
          Schema = _config$get.mongoose.Schema;
      var UserSchema = new Schema({
        provider: {
          type: String,
          required: true,
          "enum": ['local', 'google', 'facebook']
        },
        // users login or gid_xxxxxxxxxxxx, fid_xxxxxxxxxxxx,
        login: {
          type: String,
          required: true,
          unique: true
        },
        email: {
          type: String,
          required: true
        },
        avatar: {
          type: String,
          "default": _config2.config.get.defaultAvatar
        },
        name: {
          type: String,
          required: true,
          "default": function _default() {
            return this.login;
          }
        },
        surname: {
          type: String,
          required: true,
          "default": ''
        },
        role: {
          type: String,
          "enum": ['casual', 'guest', 'user', 'manager', 'admin', 'google', 'facebook'],
          "default": 'guest'
        },
        ban: {
          type: Number,
          "default": 0
        },
        createdAt: {
          type: Number
        },
        commentsReadedTill: {
          type: Number
        },
        // only for native
        password: {
          type: String,
          "default": 0
        },
        passwordTries: {
          type: Number,
          "default": 0
        },
        passwordLockTries: {
          type: Number,
          "default": 5
        },
        passwordLockUntil: {
          type: Number,
          "default": 0
        },
        code: {
          type: String,
          "default": null
        },
        codeTries: {
          type: Number,
          "default": 1
        },
        codeLockTries: {
          type: Number,
          "default": 3
        },
        // only for !native
        providersId: {
          type: String
        },
        accessToken: {
          type: String
        },
        refreshToken: {
          type: String
        } // {
        // toObject: {virtuals: true},
        // toJSON: {virtuals: true}
        // }

      });
      UserSchema.virtual('isCodeLocked').get(function () {
        return UserSchema.codeLockTries <= UserSchema.codeTries;
      });
      UserSchema.virtual('isPasswordLocked').get(function () {
        var dateNow = Date.now(); // in seconds

        return UserSchema.passwordLockUntil > dateNow;
      });
      var ChatActiveUserSchema = new Schema({
        session_id: {
          type: String,
          required: true
        },
        socket_id: {
          type: String,
          required: true
        },
        updatedAt: {
          type: Date,
          "default": function _default() {
            return Date.now();
          }
        }
      });
      ChatActiveUserSchema.pre('save', function (next) {
        ChatActiveUserSchema.updatedAt = Date.now();
        next();
      });
      mongoose.model('chatActiveUsers', ChatActiveUserSchema);
      mongoose.model('users', UserSchema);
    }
  }, {
    key: "get",
    get: function get() {
      return _config2.config.get.mongoose;
    }
  }]);

  return Mongoose;
}();

var mongoose = new Mongoose();
exports.mongoose = mongoose;