import { DbController } from '../../components/db';
import { injector } from '../../injector';

export class DbRouter {
  constructor(router) {
    this.router = router;
    this.dbController = injector.get(DbController);
  }

  routes() {
    this.router.get('/items-by-parent/:collection/:parent',
        this.dbController.itemsByParent()
    );

    return this.router;
  }
}
