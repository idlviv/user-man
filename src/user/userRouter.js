// import { config } from '../config';
// const { router } = config.get;
import { userController } from './';
import { sharedMiddleware } from '../shared';

// router.get('/user/logout',
//     userController.logout(),
//     userController.setFrontendAuthCookie(),
//     userController.logoutResponse(),
// );

// export const userRouter = router;

export class UserRouter {
  constructor(router, passport, cloudinary) {
    this.router = router;
    this.passport = passport;
    this.cloudinary = cloudinary;
    this.userController = userController;
    this.sharedMiddleware = sharedMiddleware;
  }

  routes() {
    this.router.get('/user/login',
        this.passport.authenticate('local'),
        this.userController.setFrontendAuthCookie(),
        this.userController.login()
    );

    this.router.get('/user/logout',
        this.userController.logout(),
        this.userController.setFrontendAuthCookie(),
        this.userController.logoutResponse(),
    );

    this.router.post('/user/create',
        this.sharedMiddleware.recaptcha(),
        this.userController.create(),
        this.passport.authenticate('localWithoutPassword'),
        this.userController.setFrontendAuthCookie(),
        this.userController.login()
    );

    // 1step: on google authenticate buntton press
    this.router.get('/user/auth/google',
        // 2step: passport redirects to google 'chose account' window
        this.passport.authenticate(
            'google',
            {
              scope: ['profile', 'email'],
              accessType: 'offline',
            },
            { session: false })
    );

    // 3.step: after user chose his account google redirects here
    // this uri was saved on google api and in passport options
    this.router.get('/user/auth/google/redirect',

        // 4.step: passport get code from google, extracts 'scope' info
        // and passed it to the callback function (./config/passport)
        this.passport.authenticate('google', { session: true }),

        // 5.step: set user cookie (for frontend manipulations)
        this.userController.setFrontendAuthCookie(),

        // 6.step: redirect to frontend
        function(req, res, next) {
          res.redirect('/user/redirection-after-oauth');
        },
    );

    this.router.get('/user/profile',
        this.sharedMiddleware.authentication(),
        this.userController.profile()
    );

    this.router.get('/user/checkauthorization',
        this.sharedMiddleware.checkAuthorization()
    );

    // edit 'local users' credentials (name, surname, password)
    this.router.put('/user/edit',
        this.sharedMiddleware.authentication(),
        this.userController.userEdit()
    );

    this.router.put('/user/editUnsecure',
        this.sharedMiddleware.authentication(),
        this.sharedMiddleware.authorization('user'),
        this.userController.userEditUnsecure()
    );

    this.router.put('/user/edit-avatar',
        this.sharedMiddleware.authentication(),
        this.userController.editAvatar(this.cloudinary)
    );


    // first step to reset password
    this.router.get('/user/password-reset-check-email',
        // logout if user already logged in
        this.userController.logout(),
        this.userController.setFrontendAuthCookie(),
        this.sharedMiddleware.recaptcha(),
        this.userController.passwordResetCheckEmail()
    );

    // second step to reset password
    this.router.get('/user/password-reset-check-code',
        // function (req, res, next) {
        //   // call passport authentication passing the "local" strategy name and a callback function
        //   passport.authenticate('jwt.passwordResetCheckCode', function (error, user, info) {
        //     // this will execute in any case, even if a passport strategy will find an error
        //     // log everything to console
        //     console.log('error', error);
        //     console.log('user', user);
        //     console.log('info', info);

        //     if (error) {
        //       res.status(401).send(error);
        //     } else if (!user) {
        //       res.status(401).send(info);
        //     } else {
        //       next();
        //     }

        //     res.status(401).send(info);
        //   })(req, res);
        // },
        this.passport.authenticate('jwt.passwordResetCheckCode', { session: false }),
        this.userController.passwordResetCheckCode()
    );

    // third step to reset password
    this.router.get('/user/password-reset',
        this.passport.authenticate('jwt.passwordReset', { session: false }),
        this.userController.passwordReset(),
        this.passport.authenticate('localWithoutPassword', { session: true }),
        this.userController.setFrontendAuthCookie(),
        this.userController.login()
    );

    return this.router;
  }
}
