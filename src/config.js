export class Config {
  constructor() {
    if (Config.exists) {
      return Config.instance;
    }
    Config.instance = this;
    Config.exists = true;
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
}

export const config = new Config();
