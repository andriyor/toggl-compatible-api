const { Pool } = require("pg");

const { responseTag } = require("../../../schema/schema");

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
				properties: responseTag,
				required: ["id", "wid", "name"]
			}
		}
	}
};

module.exports = async fastify => {
	const { id, ...tagPost } = responseTag;
	const { wid, ...tagPut } = tagPost;
	const tagPostPutSchema = {
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
	fastify.post("/", tagPostPutSchema, async (request, reply) => {
		const createTagQuery = `INSERT INTO tags(name, wid)
                            VALUES ($1, $2) RETURNING *`;
		const projectUserValues = [request.body.tag.name, request.body.tag.wid];
		try {
			const { rows } = await pool.query(createTagQuery, projectUserValues);
			return { data: rows[0] };
		} catch (e) {
			if (e.code === "23505") {
				reply.code(400).send(`Tag already exists: ${request.body.tag.name}`);
			}
		}
	});

	const tagIdParam = {
		type: "object",
		properties: {
			tag_id: {
				type: "string",
				description: "tag id"
			}
		}
	};
	const updateTagSchema = {
		schema: {
			tags: ["tag"],
			summary: "Update a tag",
			params: tagIdParam,
			body: {
				type: "object",
				properties: {
					tag: {
						type: "object",
						properties: tagPut,
						required: ["name"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.put("/:tag_id", updateTagSchema, async request => {
		const updateOneTagQuery = `UPDATE tags
                               SET name=$1
                               WHERE id = $2 RETURNING *`;
		const tagValues = [request.body.tag.name, request.params.tag_id];
		const { rows } = await pool.query(updateOneTagQuery, tagValues);
		return { data: rows[0] };
	});

	const projectDeleteSchema = {
		schema: {
			tags: ["tag"],
			summary: "Delete a tag",
			params: tagIdParam
		}
	};
	fastify.delete("/:project_id", projectDeleteSchema, async request => {
		const query = "DELETE FROM tags WHERE id = $1;";
		await pool.query(query, [request.params.tag_id]);
		return "OK";
	});
};
