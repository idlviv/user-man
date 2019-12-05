import { ClientError, ServerError, DbError } from '../../errors';
import { Config } from '../../config';
import { Libs } from '../../libs';
import { SharedService } from '../../shared';
import { injector } from '../../injector';
import { Mongoose } from '../../libs/mongoose';

export class DbController {
  constructor() {
    this.sharedService = injector.get(SharedService);
    this.config = injector.get(Config);
    this.libs = injector.get(Libs);
    this.mongoose = injector.get(Mongoose);
    this.UserModel = this.mongoose.get.models.users;
  }

  itemsByParent() {
    return (req, res, next) => {
      const displayFilter = req.query.display;
      const sort = +req.query.sort || -1;
      const skip = +req.query.skip || 0;
      const limit = +req.query.limit || 12;

      const collection = req.params.collection;
      const parent = req.params.parent;
      let query;
    displayFilter === 'true' ?
      query = { parents: parent, display: true } : query = { parents: parent };
    switch (collection) {
      case 'products':
        this.mongoose.get.models[collection].aggregate([
        // this.mongoose.get.models.products.aggregate([
          {
            $facet: {
              totalLength: [
                { $match: query },
                { $count: 'totalItemsLength' },
              ],
              items: [
                { $match: query },
                { $sort: { updatedAt: sort } },
                { $skip: skip },
                { $limit: limit },
              ],
            },
          },
          {
            $project: {
              total: {
                $arrayElemAt: ['$totalLength', 0],
              },
              items: 1,
            },
          },
        ])
            .then((result) => res.status(200).json(result))
            .catch((err) => next(new DbError()));
        break;
      case 'mc':
        res.status(200).json(new ResObj(
            true, 'mc категорії', null)
        );
        break;
      default:
        return next(new ClientError({ message: 'Немає такої колекції: ' + collection, status: 400 }));
    }
    };
  }
}
