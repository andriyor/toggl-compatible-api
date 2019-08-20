import pool from "./db";

import { TimeEntries } from "./timeEntries";
import { Tasks } from "./tasks";
import { ProjectUsers } from "./projectUsers";

import { Project } from "../models/Project";
import { Task } from "../models/Task";
import { ProjectUser } from "../models/ProjectUser";

export class Projects {
	static async getById(projectId: string): Promise<Project> {
		const query = "SELECT * FROM projects WHERE id = $1";
		const { rows } = await pool.query(query, [projectId]);
		return rows[0];
	}

	static getValues(project: Project, oldProject: Project) {
		return [
			project.name || oldProject.name,
			project.wid || oldProject.wid,
			project.cid || oldProject.cid,
			project.hasOwnProperty("active") ? project.active : oldProject.active,
			project.hasOwnProperty("is_private") ? project.is_private : oldProject.is_private,
			project.hasOwnProperty("template") ? project.template : oldProject.template,
			project.template_id || oldProject.template_id,
			project.hasOwnProperty("billable") ? project.billable : oldProject.billable,
			project.hasOwnProperty("auto_estimates") ? project.auto_estimates : oldProject.auto_estimates,
			project.estimated_hours || oldProject.estimated_hours,
			new Date(),
			project.color || oldProject.color,
			project.rate || oldProject.rate
		];
	}

	static async create(project: Project): Promise<Project> {
		const createProjectQuery = `INSERT INTO projects(name, wid, cid, active, is_private, template, template_id,
                                                     billable, auto_estimates, estimated_hours, at, color, rate)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;
		const projectValues = Projects.getValues(project, {} as Project);
		const { rows } = await pool.query(createProjectQuery, projectValues);
		return rows[0];
	}

	static async updateOne(projectId: string, project: Project): Promise<Project> {
		const findOneProjectQuery = "SELECT * FROM projects WHERE id = $1";
		const result = await pool.query(findOneProjectQuery, [projectId]);

		const updateOneProjectQuery = `UPDATE projects
                                   SET name=$1,
                                       wid=$2,
                                       cid=$3,
                                       active=$4,
                                       is_private=$5,
                                       template=$6,
                                       template_id=$7,
                                       billable=$8,
                                       auto_estimates=$9,
                                       estimated_hours=$10,
                                       at=$11,
                                       color=$12,
                                       rate=$13
                                   WHERE id = $14 RETURNING *`;
		const projectValues = Projects.getValues(project, result.rows[0]);
		const { rows } = await pool.query(updateOneProjectQuery, [...projectValues, projectId]);
		return rows[0];
	}

	static async destroy(projectId: string) {
		await ProjectUsers.destroyByProjectId(projectId);
		await TimeEntries.unsetProject(projectId);
		await Tasks.destroyByProjectId(projectId);
		const query = "DELETE FROM projects WHERE id = $1;";
		await pool.query(query, [projectId]);
	}

	static async getProjectUsersByProjectId(projectId: string): Promise<ProjectUser[]> {
		const query = "SELECT * FROM project_users WHERE pid = $1";
		const { rows } = await pool.query(query, [projectId]);
		return rows;
	}

	static async getTasksByProjectId(projectId: string): Promise<Task[]> {
		const query = "SELECT * FROM tasks WHERE pid = $1";
		const { rows } = await pool.query(query, [projectId]);
		return rows;
	}
}
