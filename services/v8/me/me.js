const { Pool } = require("pg");
const auth = require('basic-auth');

const config = {
	user: "postgres", //this is the db user credential
	database: "toggl_like",
	password: "18091997",
	port: 5432,
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000
};

const pool = new Pool(config);

const responseUser = {
	id: {
		type: "integer"
	},
	api_token: {
		type: "string"
	},
	default_wid: {
		type: "integer"
	},
	email: {
		type: "string"
	},
	fullname: {
		type: "string"
	},
	jquery_timeofday_format: {
		type: "string"
	},
	jquery_date_format: {
		type: "string"
	},
	timeofday_format: {
		type: "string"
	},
	date_format: {
		type: "string"
	},
	store_start_and_stop_time: {
		type: "boolean"
	},
	beginning_of_week: {
		type: "integer"
	},
	language: {
		type: "string"
	},
	image_url: {
		type: "string",
		format: "uri",
		"qt-uri-protocols": ["https"],
		"qt-uri-extensions": [".png"]
	},
	sidebar_piechart: {
		type: "boolean"
	},
	at: {
		type: "string",
		format: "date-time"
	},
	retention: {
		type: "integer"
	},
	record_timeline: {
		type: "boolean"
	},
	render_timeline: {
		type: "boolean"
	},
	timeline_enabled: {
		type: "boolean"
	},
	timeline_experiment: {
		type: "boolean"
	}
};

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: responseUser,
				required: ["id"]
			}
		}
	}
};

module.exports = async fastify => {

	const userSchema = {
		schema: {
			tags: ["user"],
			summary: "Get current user data",
			response: successfulResponse
		}
	};
	fastify.get("/", userSchema, async (request, reply) => {
		const user = auth.parse(request.headers.authorization);
		const query = "SELECT * FROM users WHERE fullname = $1";
		const { rows } = await pool.query(query, [user.name]);
		if (!rows.length || rows.password !== user.password) {
			reply
				.code(403)
				.header('Content-Type', 'application/json; charset=utf-8')
				.send()
		}
		else {
			return { data: rows[0] };
		}
	});
};
