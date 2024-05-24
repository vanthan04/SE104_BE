const nodemailer = require("nodemailer");
require("dotenv").config();

const sendmail = (receiverEmail, subject, html) => {
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
        timeout: 10000,
        debug: true, // show debug output
        logger: true // log information in console
    });

    var mailOptions = {
        from: `QUAN LI THU VIEN<${process.env.AUTH_EMAIL}>`,
        to: receiverEmail,
        subject: subject,
        html: html,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
    });

};

module.exports = {
    sendmail
};