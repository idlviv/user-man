const nodemailer = require('nodemailer');

class Config {
  constructor() {
    // make singleton
    if (Config.exists) {
      return Config.instance;
    }
    Config.instance = this;
    Config.exists = true;
    // initialization
    this.options = {};
  }

  get get() {
    return this.options;
  }

  getOptions() {
    return this.options;
  }

  init(options) {
    this.options = options;
  }

  get emailTransporter() {
    return nodemailer.createTransport({
      service: 'Mailgun',
      auth: {
        user: this.get.emailUser,
        pass: this.get.emailPassword,
      },
    });
  }

}

export const config = new Config();
