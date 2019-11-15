import { Singleton } from './helpers/singleton';
import { ServerError } from './errors';

export class Injector extends Singleton {
  constructor() {
    super();
    // init with empty depenency container
    this.container = [];
  }

  /**
   * Returns instance of demanded class
   *
   * helper - no dependecies
   * libs - helpers, (not another libs)
   * sharedService - libs, helpers,
   * service - libs, helpers, sharedService
   * controller - all
   *
   * @param {Class | String} Injected // demanded class or it's token
   * @return {Object} // instance of demanded class
   * @memberof Injector
   */
  get(Injected) {
    // console.log('Injected', Injected && Injected.name ? Injected.name : Injected);
    if (typeof Injected !== 'string' && !(Injected instanceof Function)) {
      throw new ServerError({message: 'injected object type error: ' + typeof Injected});
    }

    // if cointainer is not empty
    if (this.container.length) {
      // looking for instance of demanded class in container
      for (const item of this.container) {
        if (item.name === (typeof Injected === 'string' ? Injected : Injected.name)) {
          return item.instance;
        }
      }
    };
    if (typeof Injected === 'string') {
      throw new ServerError({ message: 'injected class is not in container' });
    }

    // if container is empty or there's no instance
    // of demanded class in container
    // then create new instance
    const injectedClass = new Injected();
    console.log('New', Injected.name);
    this.container.push({
      name: Injected.name,
      instance: injectedClass,
    });
    // if (Injected.name === 'Config') {
    //   console.log('Config inj', injectedClass);
    // }
    return injectedClass;
  }
}

export const injector = new Injector();

