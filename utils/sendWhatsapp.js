import twilio from 'twilio';
import {TWILIO_ACCID, TWILIO_AUTHTOKEN} from '../config.js';

const twilioClient = twilio(TWILIO_ACCID, TWILIO_AUTHTOKEN);

export const sendWhatsapp = async(body, from, to) => {
  const info = await twilioClient.messages.create({
    body,
    from: `whatsapp:${from}`,
    to: `whatsapp:${to}`
  });
  console.log('Whatsapp enviado');
}