const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SEND_GRID_API_KEY)



// const msg = {
//     to: 'miguelpccastro@gmail.com',
//     from: 'miguelpccastro@gmail.com',
//     subject: 'Sending with Twilio SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//   };
// sgMail.send(msg);

const sendWelcomeEmail = (email , name) =>{
    const msg = {
        to: email,
        from: 'miguelpccastro@gmail.com',
        subject:"Welcome aboard!",
        text: `Welcome to our app ${name}, glad to have you on board, in case you have any assistance or have any questions, let us know!`
    }
    sgMail.send(msg);
}

const sendGoodByeEmail = ( email ,  name) =>{
    const msg = {
        to: email,
        from: 'miguelpccastro@gmail.com',
        subject:"Goodbye!",
        text: `Sad to see you go ${name} , would it be possible for you to let us know what we could have done better?`
    }
    sgMail.send(msg);
}

module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail
}
