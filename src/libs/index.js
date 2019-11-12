const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary');
import { passport } from './passport';
import { Config, config } from '../config';
import { mongoose } from './mongoose';
import { injector } from '../helpers';

export class Libs {
  constructor() {
    this._config = injector.get(Config);
    this._nodemailer = nodemailer;
    this._cloudinary = cloudinary;
    this._passport = passport;
    this._mongoose = mongoose;
  }

  config() {
    // configure mongoose models
    this._mongoose.config();

    // all libs that must be configured
    this._cloudinary.config({
      cloud_name: config.get.cloudinaryName,
      api_key: config.get.cloudinaryKey,
      api_secret: config.get.cloudinarySecret,
    });

    this._passport.config();
  }

  get emailTransporter() {
    return this._nodemailer.createTransport({
      service: 'Mailgun',
      auth: {
        user: config.get.emailUser,
        pass: config.get.emailPassword,
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

export const libs = new Libs();
