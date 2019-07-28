const { pool } = require("./db");

class ProjectUsers {
	static getValues(projectUser, oldProjectUser) {
		return [
			projectUser.pid || oldProjectUser.pid,
			projectUser.uid || oldProjectUser.uid,
			projectUser.wid || oldProjectUser.wid,
			projectUser.manager || oldProjectUser.manager,
			projectUser.rate || oldProjectUser.rate,
			new Date()
		];
	}

	static async create(projectUsers) {
		const createProjectUserQuery = `INSERT INTO project_users(pid, uid, wid, manager, rate, at)
                                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
		const projectUserValues = ProjectUsers.getValues(projectUsers, {});
		const { rows } = await pool.query(createProjectUserQuery, projectUserValues);
		return rows[0];
	}
}

module.exports = {
	ProjectUsers
};
