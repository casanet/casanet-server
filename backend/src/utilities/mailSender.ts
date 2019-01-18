import * as nodemailer from 'nodemailer';
import { SendMailOptions, SentMessageInfo } from 'nodemailer';

import { Configuration } from '../config';

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: Configuration.twoStepsVerification.smtpServer,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: Configuration.twoStepsVerification.userName,
        pass: Configuration.twoStepsVerification.userKey,
    },
});

/**
 * Send 2-steps verification code to email.
 * @param to mail account to sent mail to.
 * @param code generate code to send.
 */
export const SendMail = async (to: string, code: string) => {
    const mailOptions: SendMailOptions = {
        from: '"CASAnet" <' + Configuration.twoStepsVerification.userName + '>',
        to,
        replyTo: undefined,
        inReplyTo: undefined,
        subject: 'CASAnet authentication code',
        html: `<div> Your authentication code is: <br><br><b> ${code} </b><br><br> The password valid only in next 5 minutes </div>`,
    };

    // send mail with defined transport object
    return transporter.sendMail(mailOptions);
};
