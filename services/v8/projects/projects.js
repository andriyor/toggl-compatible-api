const { Pool } = require("pg");

const config = {
	user: "postgres", //this is the db user credential
	database: "toggl_like",
	password: "18091997",
	port: 5432,
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000
};

const pool = new Pool(config);

const responseProject = {
	id: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	cid: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	billable: {
		type: "boolean"
	},
	is_private: {
		type: "boolean"
	},
	active: {
		type: "boolean"
	},
	at: {
		type: "string",
		format: "date-time"
	},
	template_id: {
		type: "integer"
	},
	color: {
		type: "string",
	}
};

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

	const timeEntryByIDSchema = {
		schema: {
			tags: ["projects"],
			summary: "Get project data",
			params: projectIdParam,
			response: successfulResponse
		}
	};
	fastify.get("/:project_id", timeEntryByIDSchema, async request => {
		const query = "SELECT * FROM projects WHERE id = $1";
		const { rows } = await pool.query(query, [request.params.project_id]);
		return { data: rows[0] };
	});


	const { id, at, ...projectPost } = responseProject;
	const projectPostPutSchema = {
		schema: {
			tags: ["projects"],
			summary: "Create a time entry",
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
	fastify.post("/", projectPostPutSchema, async request => {
		const createProjectQuery = `INSERT INTO projects(name, wid, cid, active, is_private, template, template_id,
                                                     billable, auto_estimates, estimated_hours, at, color, rate)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;
		const projectValues = [
			request.body.project.name,
			request.body.project.wid,
			request.body.project.cid,
			request.body.project.active,
			request.body.project.is_private,
			request.body.project.template,
			request.body.project.template_id,
			request.body.project.billable,
			request.body.project.auto_estimates,
			request.body.project.estimated_hours,
			new Date(),
			request.body.project.color,
			request.body.project.rate
		];
		const { rows } = await pool.query(createProjectQuery, projectValues);
		return { data: rows[0] };
	});
};
