export class Singleton {
  constructor() {
    if (this.constructor.exists) {
      return this.constructor.instance;
    }
    this.constructor.instance = this;
    this.constructor.exists = true;
  }
}
