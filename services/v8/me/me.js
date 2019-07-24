const auth = require("basic-auth");

const { pool } = require("../../../db/db");
const { responseUser } = require("../../../schema/schema");

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
			reply.code(403).send();
		} else {
			return { data: rows[0] };
		}
	});
};
