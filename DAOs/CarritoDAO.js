import fetch from "node-fetch";
import Carrito from '../models/Carrito.js';
import UserDAO from './UserDAO.js'
import { URL_BASE } from '../config.js';
import { formatDate } from '../utils/utils.js'


export default class CarritoDAO {
	constructor() {
		this.productos = null;
	}

	async getCarrito() {
		const userID = global.localStorage.getItem('userID');
		const carrito = await Carrito.findOne({ userID: userID });
		if (!carrito) {
			const newCarrito = new Carrito({
				productos: [],
				timestamp: formatDate(new Date()),
				userID: userID,
			});
			await newCarrito.save();
			return newCarrito;
		} else {
			return carrito;
		}
	}

	async read() {
		const carrito = await this.getCarrito();
		const productos = await carrito.productos;
		const tempCarrito = {
			id: carrito._id,
			timestamp: carrito.timestamp,
			userID: carrito.userID,
		};

		if (productos.length > 0) {
			const carritoprods = [];
			await this.getProductos();
			productos.forEach((x) => {
				carritoprods.push(this.productos.filter((prod) => prod._id === x)[0]);
			});
			tempCarrito.productos = carritoprods;
		}
		return tempCarrito;
	}

	// Devuevo el listado completo, si el listado esta vacio devuelvo false para hacer el chequeo
	async readProds(id) {
		const carrito = await this.getCarrito();
		const productos = carrito.productos;

		if (productos.length > 0) {
			if (id) {
				if (!productos.includes(id)) {
					return { error: 'Producto no encontrado en el carrito.' };
				}
				const res = await fetch(`${URL_BASE}/api/productos/${id}`);
				return await res.json();
			}
			const carritoprods = [];
			await this.getProductos();
			productos.forEach((x) =>
				carritoprods.push(this.productos.filter((prod) => prod._id === x)[0])
			);
			return carritoprods;
		}
		return false;
	}

	async addProd(id) {
		const carrito = await this.getCarrito();
		const productos = carrito.productos;
		if (!productos.includes(id)) {
			const res = await fetch(`${URL_BASE}/api/productos/${id}`);
			const producto = res.status === 200 ? await res.json() : null;
			if (producto) {
				productos.push(id.toString());
				const userID = global.localStorage.getItem('userID');
				await Carrito.updateOne({ userID: userID }, { productos: productos });
				return producto;
			}
			return { error: `El producto con el id '${id}' no existe.` };
		}
		return { error: 'Producto ya existente en el carrito.' };
	}

	async deleteProd(id) {
		// Chequeo que item del array tiene el mismo ID para seleccionarlo
		let index;
		const carrito = await this.getCarrito();
		const productosList = carrito.productos;
		for (let i = 0; i < productosList.length; i++) {
			if (productosList[i] === id) {
				index = i;
				break;
			}
		}
		// // Si el item existe lo elimino del carrito.
		if (index != undefined) {
			const producto = await this.readProds(productosList[index]);
			productosList.splice(index, 1);

			const userID = global.localStorage.getItem('userID');
			await Carrito.updateOne({ userID: userID }, { productos: productosList });
			return producto;
		}
	}

	async comprar() {
		try {
			const carrito = await this.read();
			const userDAO = new UserDAO();
			const user = await userDAO.getByID(carrito.userID);

			const orden = {
				time: formatDate(new Date()),
				user: user,
				productos: carrito.productos,
			};

			// Elimino el carrito ya que la compra esta hecha.
			await Carrito.deleteOne({ userID: carrito.userID });
			return orden;
			
		} catch (error) {
			return false;
		}
	}

	async getProductos() {
		const res = await fetch(`${URL_BASE}/api/productos`);
		if (res.status === 200) {
			this.productos = await res.json();
		} else {
			this.productos = [];
		}
	}
}