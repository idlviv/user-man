import { Singleton } from './helpers';

export class Config extends Singleton {
  constructor() {
    super();
    // initialization
    this.options = {};
  }

  get get() {
    return this.options;
  }

  init(options) {
    // set intial configuration of user-man
    this.options = options;
  }
}

export const config = new Config();
