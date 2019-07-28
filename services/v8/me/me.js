const auth = require("basic-auth");

const { Users } = require("../../../db/me");
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
		const currentUser = auth.parse(request.headers.authorization);
		const user = await Users.getName(currentUser.name);
		if (!user || user.password !== currentUser.password) {
			reply.code(403).send();
		} else {
			return { data: user };
		}
	});
};
