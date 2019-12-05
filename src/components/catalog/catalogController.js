const ResObj = function(success, message, data) {
  this.success = success;
  this.message = message;
  this.data = data;
};

import { ClientError, ServerError, DbError } from '../../errors';
import { Config } from '../../config';
import { Libs } from '../../libs';
import { SharedService } from '../../shared';
import { injector } from '../../injector';
import { Mongoose } from '../../libs/mongoose';

export class CatalogController {
  constructor() {
    this.sharedService = injector.get(SharedService);
    this.config = injector.get(Config);
    this.libs = injector.get(Libs);
    this.mongoose = injector.get(Mongoose);
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
  getTopMenu() {
    return (req, res, next) => {
      this.CatalogModel.aggregate([
        {
          $facet: {
            common: [
              {
                $match: { parent: 'common' },
              },
              {
                $sort: { order: 1 },
              },
            ],
            system: [
              {
                $match: { parent: 'system' },
              },
              {
                $sort: { order: 1 },
              },
            ],
          },
        },
      ]).then((result) => res.status(200).json(result[0]))
          .catch((error) => next(new DbError({message: 'Помилка завантаження меню'})));
    };
  }

  /**
   * Return all parents of _id (category in catalog) to hierarchy array
   * Name and _id of current category
   *
   * @return { {_id: String, name: String, hierarchy: []} }
   */
  getAllParents() {
    return (req, res, next) => {
      const category_id = req.query.category_id;
      this.CatalogModel.aggregate([
        {
          $match: { _id: category_id },
        },
        {
          $sort: { order: 1 },
        },
        {
          $graphLookup: {
            from: 'catalogs',
            startWith: '$parent',
            connectFromField: 'parent',
            connectToField: '_id',
            as: 'hierarchy',
            // depthField: 'depthField'
          },
        },
        {
          $unwind: '$hierarchy',
        },
        {
          $addFields: { sizeOfAncestors: { $size: '$hierarchy.ancestors' } },
        },
        {
          $sort: { sizeOfAncestors: 1 },
        },
        {
          $group:
          {
            _id: '$_id',
            hierarchy: { $push: '$hierarchy' },
            name: { $first: '$name' },
          },
        },
      ]).then((result) => {
        // result[0].hierarchy.splice(0, 3);
        return res.status(200).json(result[0]);
      })
          .catch((err) => next(new DbError(new DbError({ message: 'Помилка завантаження навігації' }))));
    };
  }

  /**
 * Return all parents of category(_id)
 * included current category
 * excluded root categories, which is higher than top level
 * @return  {object[]} // Catalog items array
 */
  getAllParentsInclCurrentCategory() {
    return (req, res, next) => {
      const _id = req.query._id;
      const topLevel = req.query.topLevel;
      this.CatalogModel
          .aggregate([
            { $match: { _id } },
            // Takes document with _id: 'sweetBouquets'. Then take it's 'parent' field value (startWith).
            // matches the startWith value against the connectToField (_id in 'catalogs')
            // in matched document takes value of connectFromField (parent)
            // then searches in catalogs for '_id' with that value ..
            {
              $graphLookup: {
                from: 'catalogs',
                startWith: '$parent',
                connectToField: '_id',
                connectFromField: 'parent',
                as: 'hierarchy', // write result as field with name 'hierarchy'
              },
            },
            { $addFields: { root: '$$ROOT' } }, // add field with name 'root', value previous root

            // delete field 'hierarchy' from new 'root'
            // (get current category same as the match result in stage1)
            { $project: { 'root.hierarchy': 0 } },

            { $addFields: { hierarchyAndCurrent: { $concatArrays: ['$hierarchy', ['$root']] } } }, // concat all categories together
            { $project: { hierarchyAndCurrent: 1, _id: 0 } }, // delete all unnecessary fields

            // next steps to get in every categy length of ancestors array
            { $unwind: '$hierarchyAndCurrent' },
            { $replaceRoot: { newRoot: '$hierarchyAndCurrent' } },
            { $addFields: { sizeOfAncestors: { $size: '$ancestors' } } },

            // save root and get level of new root category
            {
              $group: {
                _id: null,
                rootElems: { $push: '$$ROOT' },
                rootLevel: { $addToSet: { $cond: [{ $eq: ['$_id', topLevel] }, '$sizeOfAncestors', ''] } },
              },
            },
            // rootLevel is [] with two elems: top level and '', convert to [] only with top level
            {
              $addFields: {
                rootLevelSet: {
                  $filter: {
                    input: '$rootLevel',
                    as: 'rootLevel',
                    cond: { $ne: ['$$rootLevel', ''] },
                  },
                },
              },
            },

            // get new [], which starts with new top level
            {
              $addFields: {
                filtered: {
                  $filter: {
                    input: '$rootElems',
                    as: 'rootElems',
                    cond: { $gte: ['$$rootElems.sizeOfAncestors', { $arrayElemAt: ['$rootLevelSet', 0] }] },
                  },
                },
              },
            },
            { $project: { filtered: 1, _id: 0 } }, // delete all unnecessary fields
            { $unwind: '$filtered' },
            { $replaceRoot: { newRoot: '$filtered' } },
            { $sort: { sizeOfAncestors: 1 } },
          ])
      // .aggregate([
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
          .then((result) => res.status(200).json(result))
          .catch((err) => next(new DbError(new DbError({ message: 'Помилка завантаження навігації' }))));
    };
  }

  /**
   * Return prefix of category
   *
   * @return {String}
   */
  getPrefix() {
    return (req, res, next) => {
      const _id = req.query._id;
      this.CatalogModel.findOne({ _id }, { prefix: 1, _id: 0 })
          .then((result) => {
            console.log('prefix', result);
            return res.status(200).json(result.prefix);
          })
          .catch((err) => next(new DbError({message: 'Момилка отримання префікса'})));
    };
  }

  // getSiblings() {
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
  getCategoryById() {
    return (req, res, next) => {
      const { _id } = req.query;
      this.CatalogModel.findOne({ _id })
          .then((result) => res.status(200).json(result))
          .catch((err) => next(new DbError({message: 'Помилка отримання категорії'})));
    };
  }

  /**
   *  Return all children of category(_id)
   *
   * @return {object[]} // Catalog items array
   */
  getChildren() {
    return (req, res, next) => {
      const parent = req.query.parent;
      this.CatalogModel.aggregate([
        {
          $match: { parent },
        },
        {
          $sort: { order: 1 },
        },
      ]).then((result) => res.status(200).json(result))
          .catch((err) => next(new DbError({ message: 'Помилка отримання підкатегорії' })));
    };
  }

  // _getDescendants(parent, depth = 0) {
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
}
