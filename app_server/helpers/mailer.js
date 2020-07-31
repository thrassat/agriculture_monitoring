nodemailer = require('nodemailer')
var link = "http://localhost:3000/gestion-comptes/new-user/";
if(process.env.NODE_ENV === 'production') {
  //todo assign bon lien 
}


module.exports.sendNewAccountMail = async function sendNewAccountMail(receveiverEmail,token) {
  return new Promise(async (resolve,reject) => {
    try {    
      let testAccount = await nodemailer.createTestAccount();
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Admin application name" <foo@example.com>', // sender address
        to: receveiverEmail, // list of receivers
        subject: "Création de compte pour APPLICATION NAME", // Subject line
        //text: "Hello world?", // plain text body
        html: "<p> Bonjour,</p> <p> Un compte vous a été crée sur la plateforme APPLICATION NAME, veuillez cliquer sur le lien suivant dans les 24heures pour établir votre mot de passe et confirmer votre compte.</p> <p> <a href='"+link+token+"'> Cliquer ici pour suivre le lien </a>  </p> <p> Cordialement </p>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      resolve();
    } 
    catch (err) {
      reject(err)
    }
  })
};

module.exports.sendResetPwdMail = async function sendResetPwdMail (receveiverEmail,token) {
  return new Promise(async (resolve,reject) => {
    try {    
      let testAccount = await nodemailer.createTestAccount();
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Admin application name" <foo@example.com>', // sender address
        to: receveiverEmail, // list of receivers
        subject: "Réinitialisation de mot de passe pour APPLICATION NAME", // Subject line
        //text: "Hello world?", // plain text body
        html: "<p> Bonjour,</p> <p> Vous avez demandé à réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant dans les 24heures pour établir votre mot de passe et effectuer le changement.</p> <p> <a href='"+link+token+'?reset=true'+"'> Cliquer ici pour suivre le lien </a>  </p> <p> Cordialement </p>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      resolve();
    } 
    catch (err) {
      reject(err)
    }
  })

};