"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserRouter = void 0;

var _user = require("../../user");

var _ = require("..");

var _libs = require("../../libs");

var _injector = require("../../injector");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UserRouter =
/*#__PURE__*/
function () {
  function UserRouter(router) {
    _classCallCheck(this, UserRouter);

    this.router = router;
    this.libs = _injector.injector.get(_libs.Libs);
    this.cloudinary = this.libs.cloudinary;
    this.passport = this.libs.passport;
    this.userController = _injector.injector.get(_user.UserController);
    this.sharedMiddleware = _injector.injector.get(_.SharedMiddleware);
  }

  _createClass(UserRouter, [{
    key: "routes",
    value: function routes() {
      this.router.get('/user/login', this.passport.authenticate('local'), this.sharedMiddleware.setFrontendAuthCookie(), this.userController.login());
      this.router.get('/user/logout', this.userController.logout(), this.sharedMiddleware.setFrontendAuthCookie(), this.userController.logoutResponse());
      this.router.post('/user/create', this.sharedMiddleware.recaptcha(), this.userController.create(), this.passport.authenticate('localWithoutPassword'), this.sharedMiddleware.setFrontendAuthCookie(), this.userController.login()); // 1step: on google authenticate buntton press

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
      }), // function(req, res, next) {
      //   console.log('req', req.query);
      //   next();
      // },
      // 5.step: set user cookie (for frontend manipulations)
      this.sharedMiddleware.setFrontendAuthCookie(), // 6.step: redirect to frontend
      function (req, res, next) {
        res.redirect('/user/redirection-after-oauth');
      });
      this.router.get('/user/profile', this.sharedMiddleware.authentication(), this.userController.profile());
      this.router.get('/user/checkauthorization', this.sharedMiddleware.checkAuthorization()); // edit 'local users' credentials (name, surname, password)

      this.router.put('/user/edit', this.sharedMiddleware.authentication(), this.userController.userEdit());
      this.router.put('/user/editUnsecure', this.sharedMiddleware.authentication(), this.sharedMiddleware.authorization('user'), this.userController.userEditUnsecure());
      this.router.put('/user/edit-avatar', this.sharedMiddleware.authentication(), this.userController.editAvatar());
      this.router.get('/user/email-verification-send', this.sharedMiddleware.authentication(), this.userController.emailVerificationSend());
      this.router.get('/user/email-verification', this.sharedMiddleware.authentication(), function (req, res, next) {
        next();
      }, this.passport.authenticate('jwt.email.verification', {
        session: false
      }), function (req, res, next) {
        next();
      }, this.userController.emailVerificationReceive(), // this.sharedMiddleware.setFrontendAuthCookie(),
      function (req, res, next) {
        res.redirect(req.protocol + '://' + req.get('host') + '/user/profile/');
      }); // first step to reset password

      this.router.get('/user/password-reset-check-email', // logout if user already logged in
      this.userController.logout(), this.sharedMiddleware.setFrontendAuthCookie(), this.sharedMiddleware.recaptcha(), this.userController.passwordResetCheckEmail()); // second step to reset password

      this.router.get('/user/password-reset-check-code', this.passport.authenticate('jwt.passwordResetCheckCode', {
        session: false
      }), this.userController.passwordResetCheckCode()); // third step to reset password

      this.router.get('/user/password-reset', this.passport.authenticate('jwt.passwordReset', {
        session: false
      }), this.userController.passwordReset(), this.passport.authenticate('localWithoutPassword', {
        session: true
      }), this.sharedMiddleware.setFrontendAuthCookie(), this.userController.login());
      return this.router;
    }
  }]);

  return UserRouter;
}();

exports.UserRouter = UserRouter;