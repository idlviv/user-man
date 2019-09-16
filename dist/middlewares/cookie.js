// import { cryptHelper } from '../helpers';
// import { config } from '../config';
// export class Cookie {
//   constructor() { }
//   static createJWT(prefix, sub, expire, secret) {
//     return cryptHelper().createJWT(prefix, sub, expire, secret);
//   }
//   // setUserCookie({ JWTSecret, cookieName }) {
//   setUserCookie() {
//     const { JWTSecret, cookieName } = config.get;
//     return (req, res, next) => {
//       let token;
//       if (req.isAuthenticated()) {
//         const user = {
//           _id: req.user._doc._id,
//           login: req.user._doc.login,
//           name: req.user._doc.name,
//           surname: req.user._doc.surname,
//           avatar: req.user._doc.avatar,
//           provider: req.user._doc.provider,
//           role: req.user._doc.role,
//           commentsReadedTill: req.user._doc.commentsReadedTill,
//         };
//         token = this.constructor.createJWT('', user, null, JWTSecret);
//         // token = CookieHelper.createJWT('', user, null, JWTSecret);
//       } else {
//         token = this.constructor.createJWT('', null, null, JWTSecret);
//         // token = CookieHelper.createJWT('', null, null, JWTSecret);
//       }
//       res.cookie(
//           cookieName,
//           token,
//           {
//           // 'secure': false,
//             httpOnly: false,
//             // maxAge: null,
//             sameSite: 'Strict',
//           }
//       );
//       next();
//     };
//   }
// }
"use strict";