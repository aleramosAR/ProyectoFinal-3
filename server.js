import path from "path";
import express from "express";
import fetch from "node-fetch";
import handlebars from "express-handlebars";
import MongoStore from 'connect-mongo';
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import bCrypt from 'bcrypt';
import cluster from "cluster";
import os from 'os';
import { formatDate } from './utils/utils.js'
import { sendMailEthereal } from './utils/sendMail.js';
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { Strategy as LocalStrategy} from 'passport-local';
import { LocalStorage } from "node-localstorage";
import { PORT, URL_BASE, ADMIN, MONGO_URI, CLUSTER, configMongo, ADMIN_EMAIL } from './config.js';

import User from './models/User.js';
import logger from './utils/logger.js';
import routes from './routes/index.js';
import UserDAO from "./DAOs/UserDAO.js";

global.localStorage = new LocalStorage('./data');
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();
configApp(app);

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

(async () => {
	try {
		await configMongo("dbaas");
		connectSocket(io);
	} catch (err) {
		logger.error(err.message);
	}
})();

// Funcion para agregar toda la configuracion al 'app'.
function configApp(app) {
	app.use(cookieParser());
	app.use(session({
		store: MongoStore.create({
			mongoUrl: MONGO_URI,
			mongoOptions: {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
		}),
		secret: 'clavesecreta',
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: { maxAge: 600 * 1000 },
	}));

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(express.static("public"));

	app.set("views", "./views");
	app.set("view engine", "hbs");

	app.engine(
		"hbs",
		handlebars({
			extname: "hbs",
			defaultLayout: "layout.hbs",
			layoutsDir: __dirname + "/views/layouts",
			partialsDir: __dirname + "/views/partials",
		})
	);

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(routes);
}



passport.use('register', new LocalStrategy(
	{ passReqToCallback: true }, (req, username, password, done) => {
    const findOrCreateUser = function() {
      User.findOne({ 'username': username }, (err, user) => {
        if (err) {
          logger.error('Error de registro: ' + err);
          return done(err);
        }
        if (user) {
          return done(null, false, logger.warn("El usuario ya existe."));
        } else {
					try {
						const user = new User();
						user.username = username;
						user.password = createHash(password);
						user.email = req.body.email;
						user.telefono = req.body.telefono;
						user.direccion = req.body.direccion;
						user.edad = req.body.edad;
						user.foto = "template.jpg";

						const userdata = {
							username: username,
							email: req.body.email,
							telefono: req.body.telefono,
							direccion: req.body.direccion,
							edad: req.body.edad
						}
						const userDAO = UserDAO.getInstance();
						userDAO.setUser(userdata);

						user.save(async function(err) {
							if (err) {
								logger.error(`Error grabando al usuario ${user.username}`);
								throw err;
							}
							logger.info('Usuario creado');

							// Envio de email al admin
							const asunto = `El usuario ${user.username} se registró a las ${formatDate(new Date())}`;
							const cuerpo = `
								<strong>Se ha registrado un nuevo usuario con los siguientes datos:</strong>
								<br /><br />
								<strong>Nombre:</strong> ${user.username},<br />
								<strong>Email:</strong> ${user.email},<br />
								<strong>Teléfono:</strong> ${user.telefono},<br />
								<strong>Dirección:</strong> ${user.direccion},<br />
								<strong>Edad:</strong> ${user.edad}
							`;

							await sendMailEthereal({
								to: ADMIN_EMAIL,
								subject: asunto,
								html: cuerpo
							});
							
							global.localStorage.setItem('userID', user._id);
							return done(null, user);
						});
					} catch (error) {
						logger.error(error);
					} 
        }
      });
    }
    process.nextTick(findOrCreateUser);
	})
);

passport.use('login', new LocalStrategy(
	{ passReqToCallback: true }, (req, username, password, done) => {
    User.findOne({ 'username': username }, (err, user) => {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, logger.warn('Usuario no encontrado'));
			}
			if (!isValidPassword(user, password)) {
				return done(null, false, logger.warn('Password invalido'));
			}
			const userDAO = UserDAO.getInstance();
			userDAO.setUser(user);
			global.localStorage.setItem('userID', user._id);
			return done(null, user);
		});
	})
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (username, done) {
	const usuario = User.findOne({ username: username }, (err, user) => {
		if (err) {
			return done('error');
		}
		return done(null, usuario);
	});
});


// Funcion que devuelve los productos y emite el llamado a "listProducts"
const getProducts = () => {
	fetch(`${URL_BASE}/api/productos`)
	.then((res) => res.json())
	.then((data) => {
		const prods = { productos: data }
		io.sockets.emit("listProducts", { productos: prods, admin: ADMIN });
	});	
}

// Funcion que recarga la pagina con los productos filtrados
const filterProducts = productos => {
	// const prods = { productos: productos }
	io.sockets.emit("listProducts", { productos: productos, admin: ADMIN });	
}

// Funcion que devuelve los productos y emite el llamado a "listCarrito"
const getCarrito = () => {
	fetch(`${URL_BASE}/api/carrito`)
	.then((res) => res.json())
	.then((data) => {
		io.sockets.emit("listCarrito", { carrito: data, admin: ADMIN  });
	});
}


function connectSocket(io) {
	io.on("connection", (socket) => {
		logger.info("Nuevo cliente conectado!");
		const url = socket.handshake.headers.referer.split("/").pop();
		switch (url) {
			case "productos":
				(async ()=>{
					const initialProducts = getProducts();
					io.sockets.emit("listProducts", { productos: initialProducts, admin: ADMIN });
				})()
				break;
			case "carrito":
				(async ()=>{
					const initialCarrito = getCarrito();
					io.sockets.emit("listCarrito", { carrito: initialCarrito, admin: ADMIN  });
				})()
				break;
		}
		
		/* Escucho los mensajes enviado por el cliente y se los propago a todos */
		socket.on("postProduct", () => {
			getProducts();
		}).on("removeProduct", () => {
			getProducts();
		}).on("filterProducts", (productos) => {
			filterProducts(productos);
		}).on("removeCarritoProduct", () => {
			getCarrito();
		}).on('disconnect', () => {
			logger.info('Usuario desconectado')
		});
	});
}


const createHash = (password) => {
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

const isValidPassword = (user, password) => {
	return bCrypt.compareSync(password, user.password);
};



// Si el modo es 3 (Cluster) inicializo el servidor en modo Cluster, caso contrario lo hago en modo normal
if (CLUSTER === true) {

	if (cluster.isMaster) {
		logger.info(`PID MASTER ${process.pid}`);
		
		const numCPUs = os.cpus().length;
		for (let i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		cluster.on('exit', (worker) => {
			logger.info('Worker', worker.process.pid, 'desconectado', new Date().toLocaleString());
			cluster.fork();
		});
	} else {
		const app = express();

		app.get('/cluster', (req, res) => {
			res.send(`Servidor express en ${PORT} - <b>PID ${process.pid}</b> - ${new Date().toLocaleString()}`);
		});

		app.listen(PORT, (err) => {
			if (!err)
			logger.info(`Servidor express escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`);
		});
	}

} else {
	// Conexion a server con callback avisando de conexion exitosa
	httpServer.listen(PORT, () => { logger.info(`Ya me conecte al puerto ${PORT}.`) })
	.on('error', (error) => logger.error(`Hubo un error inicializando el servidor: ${error}`) );
}
