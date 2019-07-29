const { Pool } = require("pg");
const { Projects } = require("../../../db/projects");

const { responseProject } = require("../../../schema/schema");
const { responseProjectUsers } = require("../../../schema/schema");
const { responseTask } = require("../../../schema/schema");

const config = {
	user: "postgres", //this is the db user credential
	database: "toggl_like",
	password: "18091997",
	port: 5432,
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000
};

const pool = new Pool(config);

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: responseProject,
				required: ["id", "name", "wid"]
			}
		}
	}
};

function getValues(project, oldProject) {
	return [
		project.name || oldProject.name,
		project.wid || oldProject.wid,
		project.cid || oldProject.cid,
		project.active || oldProject.active,
		project.is_private || oldProject.is_private,
		project.template || oldProject.template,
		project.template_id || oldProject.template_id,
		project.billable || oldProject.billable,
		project.auto_estimates || oldProject.auto_estimates,
		project.estimated_hours || oldProject.estimated_hours,
		new Date(),
		project.color || oldProject.color,
		project.rate || oldProject.rate
	];
}

module.exports = async fastify => {
	const projectIdParam = {
		type: "object",
		properties: {
			project_id: {
				type: "string",
				description: "project id"
			}
		}
	};

	const projectByIdSchema = {
		schema: {
			tags: ["projects"],
			summary: "Get project data",
			params: projectIdParam,
			response: successfulResponse
		}
	};
	fastify.get("/:project_id", projectByIdSchema, async request => {
		const query = "SELECT * FROM projects WHERE id = $1";
		const { rows } = await pool.query(query, [request.params.project_id]);
		return { data: rows[0] };
	});

	const { id, at, ...projectPost } = responseProject;
	const projectPostPutSchema = {
		schema: {
			tags: ["projects"],
			summary: "Create project",
			body: {
				type: "object",
				properties: {
					project: {
						type: "object",
						properties: projectPost,
						required: ["name", "wid"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post("/", projectPostPutSchema, async (request, reply) => {
		const createProjectQuery = `INSERT INTO projects(name, wid, cid, active, is_private, template, template_id,
                                                     billable, auto_estimates, estimated_hours, at, color, rate)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;
		const projectValues = getValues(request.body.project, {});
		try {
			const { rows } = await pool.query(createProjectQuery, projectValues);
			return { data: rows[0] };
		} catch (e) {
			if (e.code === "23505") {
				reply.code(400).send("Name has already been taken");
			}
		}
	});

	const updateProjectSchema = {
		schema: {
			tags: ["projects"],
			params: projectIdParam,
			...projectPostPutSchema.schema,
			summary: "Update project data"
		}
	};
	fastify.put("/:project_id", updateProjectSchema, async request => {
		const findOneProjectQuery = "SELECT * FROM projects WHERE id = $1";
		const result = await pool.query(findOneProjectQuery, [request.params.project_id]);

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
		const projectValues = getValues(request.body.project, result.rows[0]);
		const { rows } = await pool.query(updateOneProjectQuery, [
			...projectValues,
			request.params.project_id
		]);
		return { data: rows[0] };
	});

	const projectDeleteSchema = {
		schema: {
			tags: ["projects"],
			summary: "Delete a project",
			params: projectIdParam
		}
	};
	fastify.delete("/:project_id", projectDeleteSchema, async request => {
		const projectIds = request.params.project_id.split(",");
		for (projectId of projectIds) {
			await Projects.destroy(projectId);
		}
		return "OK";
	});

	const projectUsersByProjectIdSchema = {
		schema: {
			tags: ["projects"],
			summary: "Get project users",
			params: projectIdParam,
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseProjectUsers
					}
				}
			}
		}
	};
	fastify.get("/:project_id/project_users", projectUsersByProjectIdSchema, async request => {
			const query = "SELECT * FROM project_users WHERE pid = $1";
			const { rows } = await pool.query(query, [request.params.project_id]);
			return rows;
		}
	);

	const projectTasksByProjectIdSchema = {
		schema: {
			tags: ["projects"],
			summary: "Get project tasks",
			params: projectIdParam,
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseTask
					}
				}
			}
		}
	};
	fastify.get("/:project_id/tasks", projectTasksByProjectIdSchema, async request => {
		const query = "SELECT * FROM tasks WHERE pid = $1";
		const { rows } = await pool.query(query, [request.params.project_id]);
		return rows;
	});
};
