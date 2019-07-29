const { pool } = require("./db");

class TimeEntries {
	static async destroy(timeEntryId) {
		const query = "DELETE FROM time_entries WHERE id = $1;";
		await pool.query(query, [timeEntryId]);
	}

	static async unsetProject(projectId) {
		const query = "UPDATE time_entries SET pid=NULL WHERE pid = $1;";
		await pool.query(query, [projectId]);
	}

	static async unsetTask(taskId) {
		const query = "UPDATE time_entries SET tid=NULL WHERE tid = $1;";
		await pool.query(query, [taskId]);
	}
}

module.exports = {
	TimeEntries
};
