import { CatalogController } from '../../components/catalog';
import { injector } from '../../injector';

export class CatalogRouter {
  constructor(router) {
    this.router = router;
    this.catalogController = injector.get(CatalogController);
  }

  routes() {
    this.router.get('/catalog/get-top-menu',
        this.catalogController.getTopMenu()
    );

    this.router.get('/catalog/get-all-parents',
        this.catalogController.getAllParents()
    );

    this.router.get('/catalog/get-all-parents-incl-current-category',
        this.catalogController.getAllParentsInclCurrentCategory()
    );

    this.router.get('/catalog/get-prefix',
        this.catalogController.getPrefix()
    );

    // this.router.get('/catalog/get-siblings',
    //     this.catalogController.getSiblings()
    // );

    this.router.get('/catalog/get-category-by-id',
        this.catalogController.getCategoryById()
    );


    this.router.get('/catalog/get-children',
        this.catalogController.getChildren()
    );

    // this.router.get('/catalog/get-descendants',
    //     this.catalogController.getDescendants()
    // );

    return this.router;
  }
}
