import express from "express";
import passport from "passport";
import fetch from "node-fetch";
import multer from "multer";
import { isAuth } from '../middlewares/Middlewares.js';
import { URL_BASE, ADMIN, ADMIN_EMAIL, ADMIN_PHONE, TWILIO_SMSNUM, TWILIO_WSNUM } from '../config.js';
import { sendMailEthereal } from '../utils/sendMail.js';
import { sendSMS } from '../utils/sendSMS.js';
import { sendWhatsapp } from '../utils/sendWhatsapp.js';
import UserDAO from "../DAOs/UserDAO.js";

export default class FrontRoutes {
	constructor() {
		this.router = express.Router();
    this.router.use(passport.initialize());
    this.router.use(passport.session());
	}

	init() {

    this.router.get("/", (req, res) => {
      if (req.isAuthenticated()) {
        res.redirect('productos');
      } else {
        res.redirect("login");
      }
    });
    
    this.router.get("/login", (req, res) => {
      if (req.isAuthenticated()) {
        res.redirect('productos');
      } else {
        res.render("login");
      }
    });
    
    this.router.get('/logout', (req, res) => {
      const { username } = req.session.passport.user;
      req.logout();
      res.render("logout", { username: username });
    })
    
    this.router.get("/unauthorized", (req, res) => {
      res.render("unauthorized");
    });
    
    this.router.get("/login-error", (req, res) => {
      res.render("login-error");
    });
    
    this.router.get("/register", (req, res) => {
      res.render("register");
    });
    
    this.router.get("/upload", isAuth, (req, res) => {
      const { username, _id } = req.session.passport.user;
      res.render("upload", { username: username, id: _id });
    });
    
    this.router.get("/register-error", (req, res) => {
      res.render("register-error");
    });
    
    this.router.get("/productos", isAuth, (req, res) => {
      fetch(`${URL_BASE}/api/productos`).then(res => res.json()).then((data) => {
        res.render("productos", { productos: data, admin: ADMIN, user: req.session.passport.user });
      });
    });
    
    this.router.get("/productos/actualizar/:id", isAuth, (req, res) => {
      const { id } = req.params;
      fetch(`${URL_BASE}/api/productos/${id}`).then(res => res.json()).then((data) => {
        res.render("actualizar", { producto: data, user: req.session.passport.user });
      });
    });
    
    this.router.get("/carrito", isAuth, (req, res) => {
      fetch(`${URL_BASE}/api/carrito`).then(res => res.json()).then((data) => {
        res.render("carrito", { carrito: data, admin: ADMIN, user: req.session.passport.user });
      });
    });

    this.router.get('/comprar', isAuth, async (req, res) => {
			const respond = await fetch(`${URL_BASE}/api/carrito/comprar`);
			const data = await respond.json();

			if (respond.status == 200) {

        // Levanto los datos de la orden para enviar los mensajes al comprador y al admin.
        const { time, user, productos } = data;

        let textoprods = "";
        let total = 0;
        productos.forEach(prod => {
          textoprods +=
          `
            Producto: ${prod.nombre}<br />
            Codigo: ${prod.codigo}<br />
            Precio: $${prod.precio}<br /><br />
          `;
          total += prod.precio;
        });

				// MAIL AL ADMIN.
        // Avisando de la nueva compra.
				const asunto = `Nueva compra de ${user.username}`;
				const cuerpo = `
					<h2>El usuario ${user.username} ha hecho una compra!</h2>
          <strong>Horario:</strong> ${time}
          <br />
          <h3>Articulos comprados:</h3>
          ${textoprods}
          <strong>Total: <span style='color:green'>$${total}</span></strong><br />
          <h3>Datos de envío:</h3>
					<strong>Nombre:</strong> ${user.username},<br />
					<strong>Email:</strong> ${user.email},<br />
					<strong>Teléfono:</strong> ${user.telefono},<br />
					<strong>Dirección:</strong> ${user.direccion}
				`;

        await sendMailEthereal({
          to: ADMIN_EMAIL,
          subject: asunto,
          html: cuerpo
        });

        // WHATSAPP AL ADMIN.
        // Avisando de la nueva compra.
        sendWhatsapp(
          asunto,
          TWILIO_WSNUM,
          ADMIN_PHONE
        );

        // SMS al nro del comprador.
        // Avisando que recibimos su orden de compra.
        sendSMS(
          'Recibimos su orden de compra. Muchas Gracias!',
          TWILIO_SMSNUM,
          user.telefono
        );
        
        // Redirect a  pagina mostrando que la orden fue exitosa.
				res.redirect('orden');
			} else {
        // Redirect a  pagina mostrando que hubo un error en la orden.
				res.redirect('orden-error');
			}
		});

    this.router.get("/orden", isAuth, (req, res) => {
      res.render("orden");
    });

    this.router.get("/orden-error", isAuth, (req, res) => {
      res.render("orden-error");
    });
    
    // SUBIR ARCHIVOS ------------------------------------------------
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'public/assets');
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg');
      }
    })
    const upload = multer({ storage: storage });
    
    this.router.post("/uploadfile", upload.single('imagen'), async(req, res, next) => {
      const file = req.file;
      if (!file) {
        const error = new Error('Por favor suba una imagen');
        error.httStatusCode = 400;
        return next(error);
      }
      const user = UserDAO.getInstance();
      const data = {
        'foto': file.filename
      }
      await user.update(req.session.passport.user._id, data);
      req.session.passport.user.foto = file.filename;
      user.setUser(req.session.passport.user);
    
      res.redirect('productos');
    });
		
		return this.router;
	}
}