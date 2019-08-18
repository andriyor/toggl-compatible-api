import pool from "./db";

class Clients {
	static async create(client: any) {
		const createQuery = `INSERT INTO clients(name, wid, notes, at)
                         VALUES ($1, $2, $3, $4) RETURNING *`;
		const values = [client.name, client.wid, client.notes, new Date()];
		const { rows } = await pool.query(createQuery, values);
		return rows[0];
	}

	static async findByID(clientId: any) {
		const query = "SELECT * FROM clients WHERE id = $1";
		const { rows } = await pool.query(query, [clientId]);
		return rows[0];
	}

	static getValues(client: any, olClient: any) {
		return [client.name || olClient.name, client.notes || olClient.notes, new Date()];
	}

	static async updateOne(clientId: number, client: any) {
		const findOneQuery = "SELECT * FROM clients WHERE id = $1";
		const result = await pool.query(findOneQuery, [clientId]);

		const updateOneQuery = `UPDATE clients
                                   SET name=$1,
                                       notes=$2,
                                       at=$3
                                   WHERE id = $4 RETURNING *`;
		const clientValues = Clients.getValues(client, result.rows[0]);
		const { rows } = await pool.query(updateOneQuery, [...clientValues, clientId]);
		return rows[0];
	}

	static async destroy(clientId: number) {
		const projectQuery = "UPDATe projects SET cid=NULL WHERE cid = $1;";
		await pool.query(projectQuery, [clientId]);
		const query = "DELETE FROM clients WHERE id = $1;";
		await pool.query(query, [clientId]);
	}

	static async getClientProjects(clientId: number) {
		const query = "SELECT * FROM projects WHERE cid = $1";
		const { rows } = await pool.query(query, [clientId]);
		return rows;
	}

	static async getClientProjectsByActive(clientId:number, active=true) {
		const query = "SELECT * FROM projects WHERE cid = $1 AND active = $2";
		const { rows } = await pool.query(query, [clientId, active]);
		return rows;
	}
}

module.exports = {
	Clients
};
