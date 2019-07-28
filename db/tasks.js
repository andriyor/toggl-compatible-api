const { pool } = require("./db");

class Tasks {
	static async create(task) {
		const query = `INSERT INTO tasks(name, pid, wid, uid, estimated_seconds, active, at, tracked_seconds)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
		const values = [
			task.name,
			task.pid,
			task.wid,
			task.uid,
			task.estimated_seconds,
			task.active,
			new Date(),
			task.tracked_seconds
		];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}
}

module.exports = {
	Tasks
};
