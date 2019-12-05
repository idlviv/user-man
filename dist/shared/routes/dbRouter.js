"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DbRouter = void 0;

var _db = require("../../components/db");

var _injector = require("../../injector");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DbRouter =
/*#__PURE__*/
function () {
  function DbRouter(router) {
    _classCallCheck(this, DbRouter);

    this.router = router;
    this.dbController = _injector.injector.get(_db.DbController);
  }

  _createClass(DbRouter, [{
    key: "routes",
    value: function routes() {
      this.router.get('/items-by-parent/:collection/:parent', this.dbController.itemsByParent());
      return this.router;
    }
  }]);

  return DbRouter;
}();

exports.DbRouter = DbRouter;