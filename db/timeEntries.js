const { pool } = require("./db");

class TimeEntries {
	static async destroy(timeEntryId) {
		const query = "DELETE FROM time_entries WHERE id = $1;";
		await pool.query(query, [timeEntryId]);
	}

	static async destroyByProjectId(projectId) {
		const query = "DELETE FROM time_entries WHERE pid = $1;";
		await pool.query(query, [projectId]);
	}
}

module.exports = {
	TimeEntries
};
