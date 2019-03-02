"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const config_1 = require("../config");
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: config_1.Configuration.twoStepsVerification.smtpServer,
    port: 465,
    secure: true,
    auth: {
        user: config_1.Configuration.twoStepsVerification.userName,
        pass: config_1.Configuration.twoStepsVerification.userKey,
    },
});
/**
 * Send 2-steps verification code to email.
 * @param to mail account to sent mail to.
 * @param code generate code to send.
 */
exports.SendMail = async (to, code) => {
    const mailOptions = {
        from: '"CASAnet" <' + config_1.Configuration.twoStepsVerification.userName + '>',
        to,
        replyTo: undefined,
        inReplyTo: undefined,
        subject: 'CASAnet authentication code',
        html: `<div> Your authentication code is: <br><br><b> ${code} </b><br><br> The password valid only in next 5 minutes. </div>`,
    };
    // send mail with defined transport object
    return transporter.sendMail(mailOptions);
};
//# sourceMappingURL=mailSender.js.map