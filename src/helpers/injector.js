import { Singleton } from './singleton';

export class Injector extends Singleton {
  constructor() {
    super();
    // init with empty depenency container
    this.container = [];
  }

  /**
   * Returns instance of demanded class
   *
   * @param {*} InjectedClass // demanded class
   * @return {Object} // instance of demanded class
   * @memberof Injector
   */
  get(InjectedClass) {
    // if cointainer is not empty
    if (this.container.length) {
      // looking for instance of demanded class in container
      for (const item of this.container) {
        if (item.name === InjectedClass.name) {
          console.log('container', this.container);
          return item.instance;
        }
      }
    };

    // if container is empty or there's no instance
    // of demanded class in container
    // then create new instance
    const injectedClass = new InjectedClass();
    this.container.push({
      name: InjectedClass.name,
      instance: injectedClass,
    });
          console.log('container', this.container);

    return injectedClass;
  }
}

export const injector = new Injector();

