const { pool } = require("./db");

class Groups {
	static async create(group) {
		const query = `INSERT INTO groups(name, wid, at)
								 VALUES ($1, $2, $3) RETURNING *`;
		const values = [group.name, group.wid, new Date()];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}
}

module.exports = {
	Groups
};
