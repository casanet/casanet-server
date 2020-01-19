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
    subject: 'CasaNet account verification',
    html: `
        <!DOCTYPE html>
        <body>
            <table style="width:420px;text-align:center;margin:0 auto;padding:30px 0;line-height:1.5;">
                <tbody>
                    <tr>
                        <td>
                            <table style="width:100%;margin-top:46px;background:#fff;
                                          box-shadow:0px 0px 15px rgb(138, 135, 135);text-align:center;">
                                <tbody>
                                    <tr>
                                        <td style="font-size:20px;font-weight:400;padding-top:120px;color:#303030;">
                                            CasaNet Verification Code
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="font-size:36px;font-weight:800;color: rgb(6, 99, 75);">${code}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size:16px;font-weight:200;padding-top:30px;color: #303030;">
                                            This code is used to validate your account:
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="font-size:16px;font-weight:400;color: #303030;
                                                   padding-bottom:108px;border-bottom:1px solid #eee;">
                                             ${to}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="font-size:13px;font-weight:200;color: #9b9b9b;padding-top:20px;">
                                            The generated code will expire within 5 minutes
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </body>`,
  };

  // send mail with defined transport object
  return transporter.sendMail(mailOptions);
};
