import nodemailer from 'nodemailer';
import {ETHEREAL_USER, ETHEREAL_PASS} from '../config.js';

function createSendMail(mailConfig) {
  const transporter = nodemailer.createTransport(mailConfig);

  return async function sendMail({ to, subject, text, html, attachments }) {
    console.log(`E-mail enviado con el siguiente subject: ${subject}`);
    const mailOptions = { from: mailConfig.auth.user, to, subject, text, html, attachments };
    return await transporter.sendMail(mailOptions)
  }
}

function createSendMailEthereal() {
  return createSendMail({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: ETHEREAL_USER, pass: ETHEREAL_PASS }
  })
}

const sendMailEthereal = createSendMailEthereal();

export { sendMailEthereal };