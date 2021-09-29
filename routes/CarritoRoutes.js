import express from 'express';
import CarritoDAO from '../DAOs/CarritoDAO.js';

const carrito = new CarritoDAO();

export default class CarritoRoutes {
	constructor() {
		this.router = express.Router();
	}

	init() {
		// Cargo el carrito completo
		this.router.get('/', async (req, res) => {
			const carritoData = await carrito.read();
			if (!carritoData) {
				return res.status(404).json({
					error: 'No hay carritos creados.',
				});
			}
			res.json(carritoData);
		});

		// Ejecutar la orden de comprar
		this.router.get('/comprar', async (req, res) => {
			const ordenData = await carrito.comprar();
			if (!ordenData) {
				res.status(404).json({ error: 'Se ha producido un error.' });
			} else {
				res.status(200).json(ordenData);
			}
		});

		// Cargo el listado de productos, devuelvo un mensajes si el listado esta vacio (devuelve false)
		this.router.get('/productos', async (req, res) => {
			// const carrito = CarritoDAO.getInstance();
			const productos = await carrito.readProds();
			if (!productos) {
				return res.status(404).json({
					error: 'No hay productos en el carrito.',
				});
			}
			res.json(productos);
		});

		// Devuelvo un determinado carrito
		this.router.get('/:id', async (req, res) => {
			// const carrito = CarritoDAO.getInstance();
			const { id } = req.params;
			const producto = await carrito.readProds(id);
			if (producto) {
				return res.json(producto);
			}
			res.status(404).json({
				error: 'Producto no encontrado en el carrito.',
			});
		});

		// Agrego un producto al carrito
		this.router.post('/agregar/:id', async (req, res) => {
			// const carrito = CarritoDAO.getInstance();
			const { id } = req.params;
			const newProduct = await carrito.addProd(id);
			if (newProduct) {
				res.status(201).json(newProduct);
			}
			res.status(400).send();
		});

		// Elimino un producto
		this.router.delete('/borrar/:id', async (req, res) => {
			// const carrito = CarritoDAO.getInstance();
			const { id } = req.params;

			// Elimino el producto segun el id que se paso y recibo la respuesta en una variable.
			// Si el producto que intente eliminar existe lo devuelvo con un status 200.
			// Si el producto que intente eliminar no existe devuelvo un error con un status 404.
			const prod = await carrito.deleteProd(id);
			if (prod) {
				return res.status(200).json(prod);
			}
			res.status(404).json({
				error: 'Producto no encontrado en el carrito.',
			});
		});

		return this.router;
	}
}
