const { pool } = require("./db");
const {TimeEntries} = require("./timeEntries");
const {Tasks} = require("./tasks");
const {ProjectUsers} = require("./projectUsers");

class Projects {
	static async destroy(projectId) {
		await ProjectUsers.destroyByProjectId(projectId);
		await TimeEntries.unsetProject(projectId);
		await Tasks.destroyByProjectId(projectId);
		const query = "DELETE FROM projects WHERE id = $1;";
		await pool.query(query, [projectId]);
	}
}

module.exports = {
	Projects
};
