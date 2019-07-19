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
		format: "integer"
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
		console.log(request.params.project_id);
		const { rows } = await pool.query(query, [request.params.project_id]);
		console.log(rows);
		return { data: rows[0] };
	});
};
