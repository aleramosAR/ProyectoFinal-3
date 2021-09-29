import fetch from "node-fetch";
import Producto from '../models/Producto.js';
import { URL_BASE } from '../config.js';

export default class ProductosDAO {
	async create(data) {
		if (data.nombre === '' || typeof data.nombre === 'undefined') return false;
		if (data.precio === '' || typeof data.precio === 'undefined') return false;
		if (data.foto === '' || typeof data.foto === 'undefined') return false;

		const newProducto = new Producto({
			nombre: data.nombre,
			descripcion: data.descripcion,
			codigo: data.codigo,
			foto: data.foto,
			precio: data.precio,
			stock: data.stock,
			timestamp: Date.now(),
		});
		
		await newProducto.save();
		return true;
	}

	async read(id, filtros = null) {
		try {
			if (id) {
				// Devuelvo resultado si hago una busqueda por ID
				const prod = await Producto.findOne({ _id: id });
				return prod ? prod : false;
				
			} else {
				let snap;
				if (filtros != null) {
					switch(filtros[0]) {
						case "nombre":
							snap = await Producto.find({ nombre: filtros[1] });
						break;
						case "codigo":
							snap = await Producto.find({ codigo: parseInt(filtros[1]) });
						break;
						case "premin":
							snap = await Producto.find({ precio: {$gte: parseInt(filtros[2]), $lte: parseInt(filtros[3])} });
						break;
						case "stkmin":
							snap = await Producto.find({ stock: {$gte: parseInt(filtros[2]), $lte: parseInt(filtros[3])} });
						break;
					}
				} else {
					snap = await Producto.find();
				}
				return (snap.length > 0) ? snap : false;
			}
		} catch (err) {
			return false;
		}
	}

	async update(id, data) {
		data.timestamp = Date.now();
		await Producto.updateOne({ _id: id }, data);
		return data;
	}

	async delete(id) {
		try {
			const res = await Producto.deleteOne({ _id: id });
			if (res.n) {
				// LLamo a la funcion para borrar el producto del carrito
				fetch(`${URL_BASE}/api/carrito/borrar/${id}`, {
					method: 'DELETE',
				});
				return JSON.stringify(res);
			}
			return false;
		} catch (err) {
			return false;
		}
	}

}