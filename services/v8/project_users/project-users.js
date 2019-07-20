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

const responseProjectUsers = {
	id: {
		type: "integer"
	},
	pid: {
		type: "integer"
	},
	uid: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	manager: {
		type: "boolean"
	},
	rate: {
		type: "integer"
	}
};

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: responseProjectUsers,
				required: ["id", "pid", "uid"]
			}
		}
	}
};

function getValues(projectUser, oldProjectUser) {
	return [
		projectUser.pid || oldProjectUser.pid,
		projectUser.uid || oldProjectUser.uid,
		projectUser.wid || oldProjectUser.wid,
		projectUser.manager || oldProjectUser.manager,
		projectUser.rate || oldProjectUser.rate,
		new Date()
	];
}

module.exports = async fastify => {
	const { id, at, ...projectUserProjectPost } = responseProjectUsers;
	const projectUserPostPutSchema = {
		schema: {
			tags: ["project-users"],
			summary: "Create a project user",
			body: {
				type: "object",
				properties: {
					project_user: {
						type: "object",
						properties: projectUserProjectPost,
						required: ["pid", "uid"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post("/", projectUserPostPutSchema, async request => {
		const createProjectUserQuery = `INSERT INTO project_users(pid, uid, wid, manager, rate, at)
                                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
		const projectUserValues = getValues(request.body.project_user, {});
		const { rows } = await pool.query(
			createProjectUserQuery,
			projectUserValues
		);
		return { data: rows[0] };
	});
};
