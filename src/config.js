// import { libs, Libs } from './libs';
import { Singleton } from './helpers';
import { injector } from './helpers';

export class Config extends Singleton {
  constructor() {
    super();
    // initialization
    this.options = {};
    // this.libs = injector.get(Libs);
  }

  get get() {
    return this.options;
  }

  init(options) {
    // set intial configuration of user-man
    this.options = options;

    // configure libs according to intial configuration of user-man
    // this.libs.config();
  }
}

export const config = new Config();
