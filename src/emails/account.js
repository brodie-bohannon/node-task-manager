const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY) 

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'joshuakosburn@gmail.com',
        subject: 'Welcome to Joshua\'s Task App',
        text: `Welcome to the app, ${name}. Let me know if you find any bugs or improvements you want to suggest!`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'joshuakosburn@gmail.com',
        subject: 'Joshua\'s Task App',
        text: `We hate to see you go, ${name}! Is there anything we could've done to keep you on board? If so, please let us know by replying to this email!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}