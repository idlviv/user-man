const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary');
import { Passport } from './passport';
import { Config } from '../config';
import { Mongoose } from './mongoose';
import { injector } from '../injector';

export class Libs {
  constructor() {
    this._config = injector.get(Config);
    this._mongoose = injector.get(Mongoose);
    this._passport = injector.get(Passport);
    this._nodemailer = nodemailer;
    this._cloudinary = cloudinary;
  }

  config() {
    // configure mongoose models
    this._mongoose.config();

    // all libs that must be configured
    this._cloudinary.config({
      cloud_name: this._config.get.cloudinaryName,
      api_key: this._config.get.cloudinaryKey,
      api_secret: this._config.get.cloudinarySecret,
    });

    this._passport.config();
  }

  get emailTransporter() {
    return this._nodemailer.createTransport({
      service: 'Mailgun',
      auth: {
        user: this._config.get.emailUser,
        pass: this._config.get.emailPassword,
      },
    });
  }

  get cloudinary() {
    return this._cloudinary;
  }

  get passport() {
    return this._passport.get;
  }

  get mongoose() {
    return this._mongoose.get;
  }
}

// export const libs = new Libs();
