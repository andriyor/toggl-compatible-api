const { pool } = require("./db");

class Workspaces {
	static async getById(workspace_id) {
		const query = "SELECT * FROM workspaces WHERE id = $1";
		const { rows } = await pool.query(query, [workspace_id]);
		return rows[0];
	}

	static async getWorkspacesByUserId(userId) {
		const userWorkspacesQuery = `SELECT workspaces.id,
                                        name,
                                        premium,
                                        admin,
                                        default_hourly_rate,
                                        default_currency,
                                        only_admins_may_create_projects,
                                        only_admins_see_billable_rates,
                                        rounding,
                                        rounding_minutes,
                                        at,
                                        logo_url
                                 FROM workspaces
                                          right join workspace_users ON workspaces.id = workspace_users.wid
                                 WHERE workspace_users.uid = $1`;
		const { rows } = await pool.query(userWorkspacesQuery, [userId]);
		return rows;
	}
}

module.exports = {
	Workspaces
};
