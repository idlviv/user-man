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
}

export const config = new Config();
