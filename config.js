import mongoose from "mongoose";
import logger from './utils/logger.js';

export const ADMIN = true;
export const CLUSTER = false;

// DATOS DEL SERVER
export const PORT = 8080;
export const URL_BASE = `http://localhost:${PORT}`;

// CONEXION MONGO ATLAS
export const  MONGO_URI = 'mongodb+srv://ale:ale@cluster0.xdmbo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

// DATOS DEL ADMIN
export const ADMIN_EMAIL = 'PASO X MENSAJE';
export const ADMIN_PHONE = 'PASO X MENSAJE';

// TWILIO
export const TWILIO_ACCID = "PASO X MENSAJE";
export const TWILIO_AUTHTOKEN = "PASO X MENSAJE";
export const TWILIO_SMSNUM = "PASO X MENSAJE";
export const TWILIO_WSNUM = "PASO X MENSAJE";

// NODEMAILER ETHEREAL
export const ETHEREAL_USER = "PASO X MENSAJE";
export const ETHEREAL_PASS = "PASO X MENSAJE";

// CONFIGURACION DE MONGODB ATLAS
export const configMongo = async(db) => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
    	useUnifiedTopology: true,
    	useCreateIndex: true,
			useFindAndModify: false
    });
    logger.info("Base de datos conectada!!!");
		// Una vez conectado me conecto al socket porque este levanta al iniciar datos de la base
  } catch (err) {
    logger.error(err.message);
  }
}