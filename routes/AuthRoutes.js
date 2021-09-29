import express from "express";

export default class AuthRoutes {
	constructor() {
		this.router = express.Router();
	}

	init() {
    // this.router.get("/login", async(req, res) => {
    //   if (!req.query.usuario) {
    //     res.status(422).send('Usuario no ingresado.');
    //   } else {
    //     req.session.usuario = req.query.usuario;
    //     res.status(200).send('Ingreso exitoso');
    //   }
    // });
    
    this.router.get("/logout", (req, res) => {
      req.session.destroy(err => {
        if (err) {
          res.json({ error: 'Hubo un error', body: err })
        } else {
          res.send("Logout");
        }
      })
    });

		return this.router;
	}
}