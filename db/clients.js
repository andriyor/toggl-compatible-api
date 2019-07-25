const { pool } = require("./db");

class Clients {
	static async create(client) {
		const createQuery = `INSERT INTO clients(name, wid, notes, at)
                            VALUES ($1, $2, $3, $4) RETURNING *`;
		const values = [client.name, client.wid, client.notes, new Date()];
		const { rows } = await pool.query(createQuery, values);
		return rows[0];
	}

	static async findByID(clientId) {
		const query = "SELECT * FROM clients WHERE id = $1";
		const { rows } = await pool.query(query, [clientId]);
		return rows[0];
	}
}

module.exports = {
	Clients
};
