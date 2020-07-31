const {user} = require('../../models/user')

module.exports.chunkArray = function(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    var myChunk; 
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }
    return tempArray;
} 

module.exports.removeElementsArray2inArray1 = function removeElementsArray2inArray1 (array1,array2) {
    for (var i=0;i<array2.length;i++) {
     let index = array1.indexOf(array2[i]); 
        if (index>-1) {
            array1.splice(index,1)
        }
    }
    return array1; 
}

//module.exports.
/*******************************/
/*      ROUTES HELPERS         */
/*******************************/ 

module.exports.isLoggedIn = function isLoggedIn(req,res,next) {
    if (req.isAuthenticated()) {
      return next() ; 
    }
    res.redirect("/login"); 
  }

  module.exports.isLoggedInAndHasAccess = async function isLoggedInAndHasAccess (req,res,next) {
    if (req.isAuthenticated()) {
      if (req.user.role === 'superadmin') {
        return next(); 
      }
      else { 
        let hasAccess = await user.hasAccessTo(req.user.email,req.params.groupId); 
        if (hasAccess) {
          return next(); 
        }  
        else { 
            res.redirect('/'); 
        } 
      }
    }
    else {
      res.redirect("/login"); 
    }

  }

module.exports.isLoggedInAndHasAdminRole = async function isLoggedInAndHasAdminRole (req,res,next) {
  if (req.isAuthenticated()) {
      if (req.user.role ==='admin' || req.user.role ==='superadmin') {
        return next(); 
      }  
      else { 
        res.redirect('/'); 
      } 
    }
  else {
    res.redirect("/login"); 
  }
}

module.exports.isLoggedInAndIsAdmin = async function isLoggedInAndIsAdmin (req,res,next) {
  if (req.isAuthenticated()) {
    if (req.user.role ==='superadmin') {
      return next(); 
    } 
    else if (req.user.role ==='admin') {
      let isAdmin = await user.isAdminOf(req.user.email,req.params.groupId);
      if (isAdmin) {
        return next(); 
      }
      else {
        res.redirect('/');
      }
    }  
    else { 
      res.redirect('/'); 
    } 
  }
  else {
    // if they aren't redirect them to the home page
    res.redirect("/login"); 
  }
}

module.exports.isLoggedInAndIsSuperAdmin = async function isLoggedInAndIsSuperAdmin (req,res,next) {
  if (req.isAuthenticated()) {
    if (req.user.role ==='superadmin') {
      return next(); 
    } 
    else {
      res.redirect('/'); 
    } 
  }
  else {
    // if they aren't redirect them to the home page
    res.redirect("/login"); 
  }
}