import { SharedService } from './sharedService';
import { SharedMiddleware } from './sharedMiddleware';

export const sharedService = new SharedService();
export const sharedMiddleware = new SharedMiddleware();
