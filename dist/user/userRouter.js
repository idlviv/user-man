"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserRouter = void 0;

var _ = require("./");

var _shared = require("../shared");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// router.get('/user/logout',
//     userController.logout(),
//     userController.setFrontendAuthCookie(),
//     userController.logoutResponse(),
// );
// export const userRouter = router;
var UserRouter =
/*#__PURE__*/
function () {
  function UserRouter(router, passport, cloudinary) {
    _classCallCheck(this, UserRouter);

    this.router = router;
    this.passport = passport;
    this.cloudinary = cloudinary;
    this.userController = _.userController;
    this.sharedMiddleware = _shared.sharedMiddleware;
  }

  _createClass(UserRouter, [{
    key: "routes",
    value: function routes() {
      this.router.get('/user/login', this.passport.authenticate('local'), this.userController.setFrontendAuthCookie(), this.userController.login());
      this.router.get('/user/logout', this.userController.logout(), this.userController.setFrontendAuthCookie(), this.userController.logoutResponse());
      this.router.post('/user/create', this.sharedMiddleware.recaptcha(), this.userController.create(), this.passport.authenticate('localWithoutPassword'), this.userController.setFrontendAuthCookie(), this.userController.login()); // 1step: on google authenticate buntton press

      this.router.get('/user/auth/google', // 2step: passport redirects to google 'chose account' window
      this.passport.authenticate('google', {
        scope: ['profile', 'email'],
        accessType: 'offline'
      }, {
        session: false
      })); // 3.step: after user chose his account google redirects here
      // this uri was saved on google api and in passport options

      this.router.get('/user/auth/google/redirect', // 4.step: passport get code from google, extracts 'scope' info
      // and passed it to the callback function (./config/passport)
      this.passport.authenticate('google', {
        session: true
      }), // 5.step: set user cookie (for frontend manipulations)
      this.userController.setFrontendAuthCookie(), // 6.step: redirect to frontend
      function (req, res, next) {
        res.redirect('/user/redirection-after-oauth');
      });
      this.router.get('/user/profile', this.sharedMiddleware.authentication(), this.userController.profile());
      this.router.get('/user/checkauthorization', this.sharedMiddleware.checkAuthorization()); // edit 'local users' credentials (name, surname, password)

      this.router.put('/user/edit', this.sharedMiddleware.authentication(), this.userController.userEdit());
      this.router.put('/user/editUnsecure', this.sharedMiddleware.authentication(), this.sharedMiddleware.authorization('user'), this.userController.userEditUnsecure());
      this.router.put('/user/edit-avatar', this.sharedMiddleware.authentication(), this.userController.editAvatar(this.cloudinary));
      return this.router;
    }
  }]);

  return UserRouter;
}();

exports.UserRouter = UserRouter;