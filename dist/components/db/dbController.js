"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DbController = void 0;

var _errors = require("../../errors");

var _config = require("../../config");

var _libs = require("../../libs");

var _shared = require("../../shared");

var _injector = require("../../injector");

var _mongoose = require("../../libs/mongoose");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DbController =
/*#__PURE__*/
function () {
  function DbController() {
    _classCallCheck(this, DbController);

    this.sharedService = _injector.injector.get(_shared.SharedService);
    this.config = _injector.injector.get(_config.Config);
    this.libs = _injector.injector.get(_libs.Libs);
    this.mongoose = _injector.injector.get(_mongoose.Mongoose);
    this.UserModel = this.mongoose.get.models.users;
  }

  _createClass(DbController, [{
    key: "itemsByParent",
    value: function itemsByParent() {
      var _this = this;

      return function (req, res, next) {
        var displayFilter = req.query.display;
        var sort = +req.query.sort || -1;
        var skip = +req.query.skip || 0;
        var limit = +req.query.limit || 12;
        var collection = req.params.collection;
        var parent = req.params.parent;
        var query;
        displayFilter === 'true' ? query = {
          parents: parent,
          display: true
        } : query = {
          parents: parent
        };

        switch (collection) {
          case 'products':
            _this.mongoose.get.models[collection].aggregate([// this.mongoose.get.models.products.aggregate([
            {
              $facet: {
                totalLength: [{
                  $match: query
                }, {
                  $count: 'totalItemsLength'
                }],
                items: [{
                  $match: query
                }, {
                  $sort: {
                    updatedAt: sort
                  }
                }, {
                  $skip: skip
                }, {
                  $limit: limit
                }]
              }
            }, {
              $project: {
                total: {
                  $arrayElemAt: ['$totalLength', 0]
                },
                items: 1
              }
            }]).then(function (result) {
              return res.status(200).json(result);
            })["catch"](function (err) {
              return next(new _errors.DbError());
            });

            break;

          case 'mc':
            res.status(200).json(new ResObj(true, 'mc категорії', null));
            break;

          default:
            return next(new _errors.ClientError({
              message: 'Немає такої колекції: ' + collection,
              status: 400
            }));
        }
      };
    }
  }]);

  return DbController;
}();

exports.DbController = DbController;