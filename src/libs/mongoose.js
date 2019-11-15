import { Config} from '../config';
import { injector } from '../injector';

export class Mongoose {
  constructor() {
    this._config = injector.get(Config);
  }

  get get() {
    return this._config.get.mongoose;
  }

  config() {
    const { mongoose, mongoose: { Schema } } = this._config.get;

    const UserSchema = new Schema({
      provider: {
        type: String,
        required: true,
        enum: ['local', 'google', 'facebook'],
      },
      // users login or gid_xxxxxxxxxxxx, fid_xxxxxxxxxxxx,
      login: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
        default: this._config.get.defaultAvatar,
      },
      name: {
        type: String,
        required: true,
        default: function() {
          return this.login;
        },
      },
      surname: {
        type: String,
        required: true,
        default: '',
      },
      role: {
        type: String,
        enum: ['casual', 'guest', 'user', 'manager', 'admin', 'google', 'facebook'],
        default: 'guest',
      },
      ban: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Number,
      },
      commentsReadedTill: {
        type: Number,
      },

      // only for native
      password: {
        type: String,
        default: 0,
      },
      passwordTries: {
        type: Number,
        default: 0,
      },
      passwordLockTries: {
        type: Number,
        default: 5,
      },
      passwordLockUntil: {
        type: Number,
        default: 0,
      },
      code: {
        type: String,
        default: null,
      },
      codeTries: {
        type: Number,
        default: 1,
      },
      codeLockTries: {
        type: Number,
        default: 3,
      },

      // only for !native
      providersId: {
        type: String,
      },
      accessToken: {
        type: String,
      },
      refreshToken: {
        type: String,
      },

      // {
      // toObject: {virtuals: true},
      // toJSON: {virtuals: true}
      // }
    });

    UserSchema.virtual('isCodeLocked').get(function() {
      return UserSchema.codeLockTries <= UserSchema.codeTries;
    });

    UserSchema.virtual('isPasswordLocked').get(function() {
      const dateNow = Date.now(); // in seconds
      return UserSchema.passwordLockUntil > dateNow;
    });

    const ChatActiveUserSchema = new Schema({
      session_id: {
        type: String,
        required: true,
      },
      socket_id: {
        type: String,
        required: true,
      },
      updatedAt: {
        type: Date,
        default: function() {
          return Date.now();
        },
      },
    });

    ChatActiveUserSchema.pre('save', function(next) {
      ChatActiveUserSchema.updatedAt = Date.now();
      next();
    });

    mongoose.model('chatActiveUsers', ChatActiveUserSchema);
    mongoose.model('users', UserSchema);
  }
}

// export const mongoose = new Mongoose();
