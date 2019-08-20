import pool from './db';
import {WorkspaceUser} from "../models/WorkspaceUser";

export class WorkspaceUsers {
	static getValues(workspaceUsers: WorkspaceUser, oldWorkspaceUsers: WorkspaceUser) {
		return [
			workspaceUsers.uid || oldWorkspaceUsers.uid,
			workspaceUsers.wid || oldWorkspaceUsers.wid,
			workspaceUsers.hasOwnProperty('admin') ? workspaceUsers.admin : oldWorkspaceUsers.admin,
			workspaceUsers.hasOwnProperty('active') ? workspaceUsers.active : oldWorkspaceUsers.active
		];
	}

	static async updateOne(workspaceUsersId: string, workspaceUsers: WorkspaceUser) {
		const findOneWorkspaceUsersQuery = "SELECT * FROM workspace_users WHERE id = $1";
		const result = await pool.query(findOneWorkspaceUsersQuery, [workspaceUsersId]);
		const updateOneWorkspaceQuery = `UPDATE workspace_users
                                     SET uid=$1,
                                         wid=$2,
                                         admin=$3,
                                         active=$4
                                     WHERE id = $5 RETURNING *`;
		const workspaceUsersValues = WorkspaceUsers.getValues(workspaceUsers, result.rows[0]);
		const { rows } = await pool.query(updateOneWorkspaceQuery, [...workspaceUsersValues, workspaceUsersId]);
		return rows[0];
	}

	static async destroy(workspaceUsersId: string) {
		const query = "DELETE FROM workspace_users WHERE id = $1;";
		await pool.query(query, [workspaceUsersId]);
	}
}
