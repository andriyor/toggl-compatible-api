const { Pool } = require("pg");
const auth = require("basic-auth");

const config = {
	user: "postgres", //this is the db user credential
	database: "toggl_like",
	password: "18091997",
	port: 5432,
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000
};

const pool = new Pool(config);

const responseWorkspace = {
	id: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	premium: {
		type: "boolean"
	},
	admin: {
		type: "boolean"
	},
	default_hourly_rate: {
		type: "integer"
	},
	default_currency: {
		type: "string"
	},
	only_admins_may_create_projects: {
		type: "boolean"
	},
	only_admins_see_billable_rates: {
		type: "boolean"
	},
	rounding: {
		type: "integer"
	},
	rounding_minutes: {
		type: "integer"
	},
	at: {
		type: "string"
	},
	logo_url: {
		type: "string"
	}
};

const successfulResponse = {
	200: {
		type: "array",
		items: {
			type: "object",
			properties: responseWorkspace
		}
	}
};

module.exports = async fastify => {
	const workspacesSchema = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspaces",
			response: successfulResponse
		}
	};
	fastify.get("/", workspacesSchema, async (request, reply) => {
		const user = auth.parse(request.headers.authorization);
		const query = "SELECT * FROM users WHERE fullname = $1";
		const { rows } = await pool.query(query, [user.name]);
		if (!rows.length || rows.password !== user.password) {
			reply.code(403).send();
		} else {
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
			const result = await pool.query(userWorkspacesQuery, [rows[0].id]);
			return result.rows;
		}
	});
};
