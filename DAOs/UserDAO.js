import User from '../models/User.js';

let instance = null;

export default class UserDAO {

	static getInstance() {
		if (!instance) {
			instance = new UserDAO();
		}
		return instance;
	}

	constructor() {
		this.current = {};
	}

	setUser(user) {
		this.current = user;
	}
	
	getUser() {
		return this.current;
	}

	async getByID(id) {
		return await User.findOne({ _id: id }, { username: 1, email: 1, telefono: 1, direccion: 1 });
	}

	async update(id, data) {
		data.timestamp = Date.now();
		await User.updateOne({ _id: id }, data);
		return data;
	}

}