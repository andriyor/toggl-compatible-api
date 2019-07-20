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

const responseTag = {
	id: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	name: {
		type: "string"
	}
};

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: responseTag,
				required: ["id", "wid", "name"]
			}
		}
	}
};

function getValues(tag, oldTag) {
	return [tag.name || oldTag.name, tag.wid || oldTag.wid];
}

module.exports = async fastify => {
	const { id, ...tagPost } = responseTag;
	const projectUserPostPutSchema = {
		schema: {
			tags: ["tag"],
			summary: "Create tag",
			body: {
				type: "object",
				properties: {
					tag: {
						type: "object",
						properties: tagPost,
						required: ["name", "wid"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post("/", projectUserPostPutSchema, async request => {
		const createTagQuery = `INSERT INTO tags(name, wid)
                            VALUES ($1, $2) RETURNING *`;
		const projectUserValues = getValues(request.body.tag, {});
		const { rows } = await pool.query(createTagQuery, projectUserValues);
		return { data: rows[0] };
	});
};
