const validator = require('express-validator');
const { check, body } = require('express-validator');

//[ NOT USED ]
// validator/sanitisers are middleware : array of middleware functions instead of arg (req,res,next)
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms/Create_genre_form
module.exports.postSetupHandler = [ 
   //check('inputTest','ce champ est requis').trim().isLength({min:1}),
   body('inputTest','ce champ est requis').not().isEmpty().trim().escape(),

    async function postSetupHandler(req,res) {
       
       /// await check('inputTest','ce champ est requis').trim().isLength({min:1})
       // console.log(req.body.inputTest)
         // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validator.validationResult(req); 
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
    /* Deprecated */
//     // Validate that the name field is not empty.
//     validator.body('inputTest','le field input text est requis').trim().isLength({min:1}),
//   // Sanitize (escape) the inputtest field.
//   validator.sanitizeBody('inputTest').escape(),
// USE : 
//https://express-validator.github.io/docs/validation-chain-api.html#sanitization-chain-api
    
}]; 