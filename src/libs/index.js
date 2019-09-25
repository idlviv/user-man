const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary');
const util = require('util');
import { passport } from './passport';
import { config } from '../config';

class Libs {
  constructor() {
    this._nodemailer = nodemailer;
    this._cloudinary = cloudinary;
    this._passport = passport;
  }

  config() {
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
}

export const libs = new Libs();
