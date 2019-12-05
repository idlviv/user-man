"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CatalogController = void 0;

var _errors = require("../../errors");

var _config = require("../../config");

var _libs = require("../../libs");

var _shared = require("../../shared");

var _injector = require("../../injector");

var _mongoose = require("../../libs/mongoose");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ResObj = function ResObj(success, message, data) {
  this.success = success;
  this.message = message;
  this.data = data;
};

var CatalogController =
/*#__PURE__*/
function () {
  function CatalogController() {
    _classCallCheck(this, CatalogController);

    this.sharedService = _injector.injector.get(_shared.SharedService);
    this.config = _injector.injector.get(_config.Config);
    this.libs = _injector.injector.get(_libs.Libs);
    this.mongoose = _injector.injector.get(_mongoose.Mongoose);
    this.CatalogModel = this.mongoose.get.models.catalogs;
  }
  /**
   * Return top menu items
   * Home(top level of catalog) ->
   *      common(top level of site menu),
   *      system(top level of system menu)
   *
   * @return { {common: [], system: []} }
   * @memberof CatalogController
   */


  _createClass(CatalogController, [{
    key: "getTopMenu",
    value: function getTopMenu() {
      var _this = this;

      return function (req, res, next) {
        _this.CatalogModel.aggregate([{
          $facet: {
            common: [{
              $match: {
                parent: 'common'
              }
            }, {
              $sort: {
                order: 1
              }
            }],
            system: [{
              $match: {
                parent: 'system'
              }
            }, {
              $sort: {
                order: 1
              }
            }]
          }
        }]).then(function (result) {
          return res.status(200).json(result[0]);
        })["catch"](function (error) {
          return next(new _errors.DbError({
            message: 'Помилка завантаження меню'
          }));
        });
      };
    }
    /**
     * Return all parents of _id (category in catalog) to hierarchy array
     * Name and _id of current category
     *
     * @return { {_id: String, name: String, hierarchy: []} }
     */

  }, {
    key: "getAllParents",
    value: function getAllParents() {
      var _this2 = this;

      return function (req, res, next) {
        var category_id = req.query.category_id;

        _this2.CatalogModel.aggregate([{
          $match: {
            _id: category_id
          }
        }, {
          $sort: {
            order: 1
          }
        }, {
          $graphLookup: {
            from: 'catalogs',
            startWith: '$parent',
            connectFromField: 'parent',
            connectToField: '_id',
            as: 'hierarchy' // depthField: 'depthField'

          }
        }, {
          $unwind: '$hierarchy'
        }, {
          $addFields: {
            sizeOfAncestors: {
              $size: '$hierarchy.ancestors'
            }
          }
        }, {
          $sort: {
            sizeOfAncestors: 1
          }
        }, {
          $group: {
            _id: '$_id',
            hierarchy: {
              $push: '$hierarchy'
            },
            name: {
              $first: '$name'
            }
          }
        }]).then(function (result) {
          // result[0].hierarchy.splice(0, 3);
          return res.status(200).json(result[0]);
        })["catch"](function (err) {
          return next(new _errors.DbError(new _errors.DbError({
            message: 'Помилка завантаження навігації'
          })));
        });
      };
    }
    /**
    * Return all parents of category(_id)
    * included current category
    * excluded root categories, which is higher than top level
    * @return  {object[]} // Catalog items array
    */

  }, {
    key: "getAllParentsInclCurrentCategory",
    value: function getAllParentsInclCurrentCategory() {
      var _this3 = this;

      return function (req, res, next) {
        var _id = req.query._id;
        var topLevel = req.query.topLevel;

        _this3.CatalogModel.aggregate([{
          $match: {
            _id: _id
          }
        }, // Takes document with _id: 'sweetBouquets'. Then take it's 'parent' field value (startWith).
        // matches the startWith value against the connectToField (_id in 'catalogs')
        // in matched document takes value of connectFromField (parent)
        // then searches in catalogs for '_id' with that value ..
        {
          $graphLookup: {
            from: 'catalogs',
            startWith: '$parent',
            connectToField: '_id',
            connectFromField: 'parent',
            as: 'hierarchy' // write result as field with name 'hierarchy'

          }
        }, {
          $addFields: {
            root: '$$ROOT'
          }
        }, // add field with name 'root', value previous root
        // delete field 'hierarchy' from new 'root'
        // (get current category same as the match result in stage1)
        {
          $project: {
            'root.hierarchy': 0
          }
        }, {
          $addFields: {
            hierarchyAndCurrent: {
              $concatArrays: ['$hierarchy', ['$root']]
            }
          }
        }, // concat all categories together
        {
          $project: {
            hierarchyAndCurrent: 1,
            _id: 0
          }
        }, // delete all unnecessary fields
        // next steps to get in every categy length of ancestors array
        {
          $unwind: '$hierarchyAndCurrent'
        }, {
          $replaceRoot: {
            newRoot: '$hierarchyAndCurrent'
          }
        }, {
          $addFields: {
            sizeOfAncestors: {
              $size: '$ancestors'
            }
          }
        }, // save root and get level of new root category
        {
          $group: {
            _id: null,
            rootElems: {
              $push: '$$ROOT'
            },
            rootLevel: {
              $addToSet: {
                $cond: [{
                  $eq: ['$_id', topLevel]
                }, '$sizeOfAncestors', '']
              }
            }
          }
        }, // rootLevel is [] with two elems: top level and '', convert to [] only with top level
        {
          $addFields: {
            rootLevelSet: {
              $filter: {
                input: '$rootLevel',
                as: 'rootLevel',
                cond: {
                  $ne: ['$$rootLevel', '']
                }
              }
            }
          }
        }, // get new [], which starts with new top level
        {
          $addFields: {
            filtered: {
              $filter: {
                input: '$rootElems',
                as: 'rootElems',
                cond: {
                  $gte: ['$$rootElems.sizeOfAncestors', {
                    $arrayElemAt: ['$rootLevelSet', 0]
                  }]
                }
              }
            }
          }
        }, {
          $project: {
            filtered: 1,
            _id: 0
          }
        }, // delete all unnecessary fields
        {
          $unwind: '$filtered'
        }, {
          $replaceRoot: {
            newRoot: '$filtered'
          }
        }, {
          $sort: {
            sizeOfAncestors: 1
          }
        }]) // .aggregate([
        //   {
        //     $match: { _id: category_id },
        //   },
        //   {
        //     $graphLookup: {
        //       from: 'catalogs',
        //       startWith: '$parent',
        //       connectFromField: 'parent',
        //       connectToField: '_id',
        //       as: 'hierarchy',
        //     },
        //   },
        //   {
        //     $addFields: { 'root': '$$ROOT' },
        //   },
        //   {
        //     $project: { 'root.hierarchy': 0 },
        //   },
        //   {
        //     $addFields: { hierarchyAndCurrent: { $concatArrays: ['$hierarchy', ['$root']] } },
        //   },
        //   {
        //     $project: { hierarchyAndCurrent: 1, _id: 0 } },
        //   {
        //     $unwind: '$hierarchyAndCurrent',
        //   },
        //   {
        //     $replaceRoot: { newRoot: '$hierarchyAndCurrent' },
        //   },
        //   { $skip: 2 },
        // ])
        .then(function (result) {
          return res.status(200).json(result);
        })["catch"](function (err) {
          return next(new _errors.DbError(new _errors.DbError({
            message: 'Помилка завантаження навігації'
          })));
        });
      };
    }
    /**
     * Return prefix of category
     *
     * @return {String}
     */

  }, {
    key: "getPrefix",
    value: function getPrefix() {
      var _this4 = this;

      return function (req, res, next) {
        var _id = req.query._id;

        _this4.CatalogModel.findOne({
          _id: _id
        }, {
          prefix: 1,
          _id: 0
        }).then(function (result) {
          console.log('prefix', result);
          return res.status(200).json(result.prefix);
        })["catch"](function (err) {
          return next(new _errors.DbError({
            message: 'Момилка отримання префікса'
          }));
        });
      };
    } // getSiblings() {
    //   return (req, res, next) => {
    //     const _id = req.query._id;
    //     this.CatalogModel.aggregate([
    //       {
    //         $match: { _id: 'toys' },
    //       },
    //       {
    //         $graphLookup: {
    //           from: 'catalogs',
    //           startWith: '$parent',
    //           connectToField: 'parent',
    //           connectFromField: '_id',
    //           as: 'siblings',
    //           maxDepth: 0,
    //         },
    //       },
    //       {
    //         $unwind: '$siblings',
    //       },
    //       {
    //         $replaceRoot: { newRoot: '$siblings' },
    //       },
    //       {
    //         $sort: { order: 1 },
    //       },
    //     ])
    //         .then((result) => {
    //           return res.status(200).json(new ResObj(true, 'Siblings', result));
    //         })
    //         .catch((err) => next(new DbError()));
    //   };
    // }

    /**
     *
     * @return {Object} // Catalog item
     */

  }, {
    key: "getCategoryById",
    value: function getCategoryById() {
      var _this5 = this;

      return function (req, res, next) {
        var _id = req.query._id;

        _this5.CatalogModel.findOne({
          _id: _id
        }).then(function (result) {
          return res.status(200).json(result);
        })["catch"](function (err) {
          return next(new _errors.DbError({
            message: 'Помилка отримання категорії'
          }));
        });
      };
    }
    /**
     *  Return all children of category(_id)
     *
     * @return {object[]} // Catalog items array
     */

  }, {
    key: "getChildren",
    value: function getChildren() {
      var _this6 = this;

      return function (req, res, next) {
        var parent = req.query.parent;

        _this6.CatalogModel.aggregate([{
          $match: {
            parent: parent
          }
        }, {
          $sort: {
            order: 1
          }
        }]).then(function (result) {
          return res.status(200).json(result);
        })["catch"](function (err) {
          return next(new _errors.DbError({
            message: 'Помилка отримання підкатегорії'
          }));
        });
      };
    } // _getDescendants(parent, depth = 0) {
    //   return (req, res, next) => {
    //     return new Promise((resolve, reject) => {
    //       this.CatalogModel.aggregate([
    //         {
    //           $match: { parent },
    //         },
    //         {
    //           $sort: { order: 1 },
    //         },
    //         {
    //           $graphLookup: {
    //             from: 'catalogs',
    //             startWith: '$_id',
    //             connectFromField: '_id',
    //             connectToField: 'parent',
    //             as: 'children',
    //             maxDepth: depth,
    //           },
    //         },
    //         {
    //           $addFields: { numOfChildren: { $size: '$children' } },
    //         },
    //       ]).then((result) => resolve(result))
    //           .catch((err) => reject(new DbError()));
    //     });
    //   };
    // }
    // getDescendants() {
    //   return (req, res, next) => {
    //     const parent = req.query.parent;
    //     const depth =+ req.query.depth;
    //     _getDescendants(parent, depth)
    //         .then((result) => {
    //           return res.status(200).json(new ResObj(true, 'Каталог', result));
    //         })
    //         .catch((err) => next(err));
    //   };
    // }

  }]);

  return CatalogController;
}();

exports.CatalogController = CatalogController;