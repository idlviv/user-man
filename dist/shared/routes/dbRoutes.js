"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CatalogRouter = void 0;

var _catalog = require("../../components/catalog");

var _injector = require("../../injector");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CatalogRouter =
/*#__PURE__*/
function () {
  function CatalogRouter(router) {
    _classCallCheck(this, CatalogRouter);

    this.router = router;
    this.catalogController = _injector.injector.get(_catalog.CatalogController);
  }

  _createClass(CatalogRouter, [{
    key: "routes",
    value: function routes() {
      this.router.get('/catalog/get-top-menu', this.catalogController.getTopMenu());
      this.router.get('/catalog/get-all-parents', this.catalogController.getAllParents());
      this.router.get('/catalog/get-all-parents-incl-current-category', this.catalogController.getAllParentsInclCurrentCategory());
      this.router.get('/catalog/get-prefix', this.catalogController.getPrefix()); // this.router.get('/catalog/get-siblings',
      //     this.catalogController.getSiblings()
      // );

      this.router.get('/catalog/get-category-by-id', this.catalogController.getCategoryById());
      this.router.get('/catalog/get-children', this.catalogController.getChildren()); // this.router.get('/catalog/get-descendants',
      //     this.catalogController.getDescendants()
      // );

      return this.router;
    }
  }]);

  return CatalogRouter;
}();

exports.CatalogRouter = CatalogRouter;