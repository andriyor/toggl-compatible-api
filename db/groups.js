const { pool } = require("./db");

class Groups {
	static async create(group) {
		const query = `INSERT INTO groups(name, wid, at)
                   VALUES ($1, $2, $3) RETURNING *`;
		const values = [group.name, group.wid, new Date()];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async updateOne(groupId, group) {
		const query = `UPDATE groups
                   SET name=$1,
                       at=$2
                   WHERE id = $3 RETURNING *`;
		const values = [group.name, new Date(), groupId];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}
}

module.exports = {
	Groups
};
