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
    const ObjectId = mongoose.Types.ObjectId;
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

    const CatalogSchema = new Schema({
      _id: {
        type: String,
        require: true,
      },
      name: {
        type: String,
        required: true,
      },
      ancestors: {
        type: [String],
        required: true,
      },
      parent: {
        type: String,
        require: true,
      },
      description: {
        type: String,
      },
      menuImage: {
        type: [String],
        default: this._config.get.defaultProductImg,
      },
      prefix: {
        type: String,
      },
    });

    const CommentSchema = new Schema({
      comment: {
        type: String,
      },
      commentator: {
        type: ObjectId,
      },
      commentedAt: {
        type: Number,
        default: 0,
      },
      display: {
        type: Boolean,
        default: false,
      },
    });

    const ProductSchema = new Schema({
      _id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      parents: {
        type: [String],
        required: true,
      },
      display: {
        type: Boolean,
        required: true,
        default: true,
      },
      onMainPage: {
        type: Boolean,
        required: true,
        default: false,
      },
      mainImage: {
        type: String,
        required: true,
      },
      menuImage: {
        type: String,
        required: true,
      },
      assets: {
        type: [String],
      },
      price: {
        type: Number,
      },
      discount: {
        type: Number,
      },
      dimensions: {
        width: {
          type: Number,
        },
        height: {
          type: Number,
        },
      },
      createdAt: {
        type: Number,
        default: 0,
      },
      updatedAt: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      likedBy: {
        type: [String],
      },
      dislikes: {
        type: Number,
        default: 0,
      },
      dislikedBy: {
        type: [String],
      },
      views: {
        type: Number,
        default: 0,
      },
      comments: [CommentSchema],
    });

    // mongoose.model('catalogs', CatalogSchema);
    mongoose.model('chatActiveUsers', ChatActiveUserSchema);
    mongoose.model('users', UserSchema);
    // mongoose.model('comments', CommentSchema);
    // mongoose.model('products', ProductSchema);
  }
}
