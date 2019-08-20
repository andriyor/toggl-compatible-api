import pool from './db';
import {ProjectUser} from "../models/ProjectUser";

export class ProjectUsers {
	static getValues(projectUser: ProjectUser, oldProjectUser: ProjectUser) {
		return [
			projectUser.pid || oldProjectUser.pid,
			projectUser.uid || oldProjectUser.uid,
			projectUser.wid || oldProjectUser.wid,
			projectUser.hasOwnProperty("manager") ? projectUser.manager : oldProjectUser.manager,
			projectUser.rate || oldProjectUser.rate,
			new Date()
		];
	}

	static async create(projectUser: ProjectUser) {
		const createProjectUserQuery = `INSERT INTO project_users(pid, uid, wid, manager, rate, at)
                                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
		const projectUserValues = ProjectUsers.getValues(projectUser, {} as ProjectUser);
		const { rows } = await pool.query(createProjectUserQuery, projectUserValues);
		return rows[0];
	}

	static getValuesForUpdate(projectUser: ProjectUser, oldProjectUser: ProjectUser) {
		return [
			projectUser.hasOwnProperty("manager") ? projectUser.manager : oldProjectUser.manager,
			projectUser.rate || oldProjectUser.rate,
			new Date()
		];
	}

	static async getById(projectUserId: string) {
		const query = "SELECT * FROM project_users WHERE id = $1";
		const { rows } = await pool.query(query, [projectUserId]);
		return rows[0];
	}

	static async updateOne(projectUserId: string, projectUser: ProjectUser) {
		const findOneQuery = "SELECT * FROM project_users WHERE id = $1";
		const result = await pool.query(findOneQuery, [projectUserId]);

		const updateOneQuery = `UPDATE project_users
                            SET manager=$1,
                                rate=$2,
                                at=$3
                            WHERE id = $4`;
		const values = ProjectUsers.getValuesForUpdate(projectUser, result.rows[0]);
		await pool.query(updateOneQuery, [...values, projectUserId]);
		if (projectUser.fields === "fullname") {
			return await ProjectUsers.getWithFullname(projectUserId);
		} else {
			return await ProjectUsers.getById(projectUserId);
		}
	}

	static async getWithFullname(projectUsersId: string) {
		const findOneQuery = `SELECT project_users.*, users.fullname
                          FROM project_users
                                   right join users on Users.id = project_users.uid
                          WHERE project_users.id = $1`;
		const { rows } = await pool.query(findOneQuery, [projectUsersId]);
		return rows[0];
	}

	static async destroy(projectUsersId: string) {
		const query = "DELETE FROM project_users WHERE id = $1;";
		await pool.query(query, [projectUsersId]);
	}

	static async destroyByProjectId(projectId: string) {
		const query = "DELETE FROM project_users WHERE pid = $1;";
		await pool.query(query, [projectId]);
	}
}
