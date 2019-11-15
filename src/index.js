import { Config } from './config';
import { injector } from './injector';
import * as errors from './errors';
import { Libs } from './libs';
import { SharedMiddleware, SharedService, UserRouter } from './shared';
import * as helpers from './helpers';

const libs = injector.get(Libs);
const sharedMiddleware = injector.get(SharedMiddleware);
const sharedService = injector.get(SharedService);

export {
  errors,
  Config, // export class for init configuration
  Libs, // export class for configure libs according to config
  UserRouter,
  helpers,
  libs, sharedMiddleware, sharedService,
};
