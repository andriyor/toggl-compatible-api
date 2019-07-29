const { pool } = require("./db");
const { TimeEntries } = require("./timeEntries");

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

	static async findByID(taskId) {
		const query = "SELECT * FROM tasks WHERE id = $1";
		const { rows } = await pool.query(query, [taskId]);
		return rows[0];
	}

	static getValues(task, oldTask) {
		return [
			task.name || oldTask.name,
			task.pid || oldTask.pid,
			task.wid || oldTask.wid,
			task.uid || oldTask.uid,
			task.estimated_seconds || oldTask.estimated_seconds,
			task.active || oldTask.active,
			new Date(),
			task.tracked_seconds || oldTask.tracked_seconds
		];
	}

	static async updateOne(taskId, task) {
		const findOneQuery = "SELECT * FROM tasks WHERE id = $1";
		const result = await pool.query(findOneQuery, [taskId]);

		const updateOneQuery = `UPDATE tasks
                            SET name=$1,
                                pid=$2,
                                wid=$3,
                                uid=$4,
                                estimated_seconds=$5,
                                active=$6,
                                at=$7,
                                tracked_seconds=$8
                            WHERE id = $9 RETURNING *`;
		const values = Tasks.getValues(task, result.rows[0]);
		const { rows } = await pool.query(updateOneQuery, [...values, taskId]);
		return rows[0];
	}

	static async destroy(taskId) {
		await TimeEntries.unsetTask(taskId);
		const query = "DELETE FROM tasks WHERE id = $1;";
		await pool.query(query, [taskId]);
	}

	static async destroyByProjectId(projectId) {
		const query = "DELETE FROM tasks WHERE pid = $1;";
		await pool.query(query, [projectId]);
	}
}

module.exports = {
	Tasks
};
