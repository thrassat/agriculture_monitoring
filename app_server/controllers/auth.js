var passport = require ('passport'); 
// const {user} = require('../../models/user');

//LOGIN
module.exports.displayLogin = function (req,res) {
    renderLogin(req,res);
}; 

var renderLogin = function (req,res,){
    res.render("login", {  
      title: 'login',
      layout: 'loginLayout',
      pageHeader: {
        title:'Login',
        strapline: 'Veuillez entrer vos identifiants de connexion'
      },
    });
  }

// try to use promise ? async/await
// POST LOGIN - AUTHENTICATION
module.exports. auth = function (req,res,next) {
    //attempts to authenticate with the strategy it receives as its first parameter
    passport.authenticate('local',
    (err, user, info) => {

        if (err) {
            return next(err);
        }
        // fail redirect to login with error message info 
        if (!user) {
            //console.log(info);
            return res.redirect('/login?info=' + info.message);
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


// LOGOUT
module.exports.logout = function (req,res) {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
        });
};