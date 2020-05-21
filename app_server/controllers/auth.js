var passport = require ('passport'); 
// tmp testing
const {user} = require('../../models/user');

// try to use promise ? async/await
module.exports.auth = function (req,res,next) {
    //attempts to authenticate with the strategy it receives as its first parameter
    passport.authenticate('local',
    (err, user, info) => {

        if (err) {
            return next(err);
        }
        // fail redirect to login with error message info 
        if (!user) {
            return res.redirect('/login?info=' + info);
        }
        // success redirect to root '/'
        req.logIn(user, function(err) {
            if (err) {
              return next(err);
            }
            return res.redirect('/');
        });
    })(req,res,next);
};
// Other example : 
// AUTHENTICATE
// router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res, next) => {
//     req.session.save((err) => {
//         if (err) {
//             return next(err);
//         }
//         res.redirect('/');
//     });
// });

// RENDER LOGIN
// router.get('/login', (req, res) => {
//     res.render('login', { user : req.user, error : req.flash('error')});
// });

module.exports.displayLogin = function (req,res) {
    renderLogin(req,res);
}; 

var renderLogin = function (req,res,){
    res.render("login", {  
      title: 'login',
    //   pageHeader: {
    //     title:'Groupes de capteurs accessibles : ',
    //     strapline: 'Date/heure - Lieu'
    //   },
    });
  }

module.exports.register = function (req,res,next) {
    /* send to api */
    user.register(new user({ username : req.body.username }), req.body.password, (err, user) => {
        if (err) {
          return res.render('register', { error : err.message });
        }
        
        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
};

module.exports.displayRegister = function (req,res) {
    renderRegister(req,res);
}; 

var renderRegister = function (req,res) {
    res.render("register", {
        title: 'register',
    });
}   

module.exports.logout = function (req,res) {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
        });
};