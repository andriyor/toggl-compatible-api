const { pool } = require("./db");

class Workspaces {
	static async getById(workspaceId) {
		const query = "SELECT * FROM workspaces WHERE id = $1";
		const { rows } = await pool.query(query, [workspaceId]);
		return rows[0];
	}

	static getValues(workspace, oldWorkspace) {
		return [
			workspace.name || oldWorkspace.name,
			workspace.premium || oldWorkspace.premium,
			workspace.default_hourly_rate || oldWorkspace.default_hourly_rate,
			workspace.default_currency || oldWorkspace.default_currency,
			workspace.only_admins_may_create_projects ||
				oldWorkspace.only_admins_may_create_projects,
			workspace.only_admins_see_billable_rates ||
				oldWorkspace.only_admins_see_billable_rates,
			workspace.rounding || oldWorkspace.rounding,
			workspace.rounding_minutes || oldWorkspace.rounding_minutes,
			new Date(),
			workspace.logo_url || oldWorkspace.logo_url
		];
	}

	static async updateOne(project, project_id) {
		const findOneProjectQuery = "SELECT * FROM projects WHERE id = $1";
		const result = await pool.query(findOneProjectQuery, [project_id]);

		const updateOneWorkspaceQuery = `UPDATE workspaces
                                     SET name=$1,
                                         premium=$2,
                                         default_hourly_rate=$3,
                                         default_currency=$4,
                                         only_admins_may_create_projects=$5,
                                         only_admins_see_billable_rates=$6,
                                         rounding=$7,
                                         rounding_minutes=$8,
                                         at=$9,
                                         logo_url=$10
                                     WHERE id = $11`;
		const workspaceValues = Workspaces.getValues(project, result.rows[0]);
		const { rows } = await pool.query(updateOneWorkspaceQuery, [
			...workspaceValues,
			project_id
		]);
		return rows[0];
	}

	static async getWorkspacesByUserId(userId) {
		const userWorkspacesQuery = `SELECT workspaces.id,
                                        name,
                                        premium,
                                        workspace_users.admin,
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

	static async getWorkspaceUsersByWorkspaceId(workspace_id) {
		const query = `SELECT users.id,
                          api_token,
                          default_wid,
                          fullname,
                          jquery_timeofday_format,
                          jquery_date_format,
                          timeofday_format,
                          date_format,
                          store_start_and_stop_time,
                          beginning_of_week,
                          language,
                          image_url,
                          sidebar_piechart,
                          at,
                          retention,
                          record_timeline,
                          render_timeline,
                          timeline_enabled,
                          timeline_experiment
                   FROM users
                            RIGHT JOIN workspace_users ON users.id = workspace_users.uid
                   WHERE workspace_users.wid = $1`;
		const { rows } = await pool.query(query, [workspace_id]);
		return rows;
	}

	static async getWorkspaceClientsByWorkspaceId(workspaceId) {
		const query = `SELECT clients.id,
                          clients.name,
                          wid,
                          notes,
                          clients.at,
                          ROUND(CAST(default_hourly_rate AS numeric), rounding) as hrate,
                          default_currency                                      as cur
                   FROM clients
                            left join workspaces on clients.wid = workspaces.id
                   WHERE wid = $1`;
		const { rows } = await pool.query(query, [workspaceId]);
		return rows;
	}
}

module.exports = {
	Workspaces
};
