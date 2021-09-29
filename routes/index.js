import express from "express";
import passport from "passport";
import ProductRoutes from './ProductRoutes.js';
import CarritoRoutes from './CarritoRoutes.js';
import FrontRoutes from './FrontRoutes.js';
import AuthRoutes from "./AuthRoutes.js";

const router = express.Router();
router.use(express.json());
router.use(passport.initialize());
router.use(passport.session());

const frontRoutes = new FrontRoutes();
const productRoutes = new ProductRoutes();
const carritoRoutes = new CarritoRoutes();
const authRoutes = new AuthRoutes();

router.post('/login', passport.authenticate('login', {
  failureRedirect: '/login-error',
  successRedirect: '/productos'
}))
router.post('/register', passport.authenticate('register', {
  failureRedirect: '/register-error',
  successRedirect: '/upload'
}))

router.use('/', frontRoutes.init(router));
router.use('/api/auth', authRoutes.init(router));
router.use('/api/productos', productRoutes.init(router));
router.use('/api/carrito', carritoRoutes.init(router))

// Middleware para mostrar error si la ruta no existe
router.use(function(req, res, next) {
	res.status(404)
	res.json({error : -2, descripcion: `Ruta '${req.url}' no implementada`});
});;


export default router;

