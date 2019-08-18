import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

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

module.exports = async (
	fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>
) => {
	const userSchema = {
		schema: {
			tags: ["user"],
			summary: "Get current user data",
			response: successfulResponse
		}
	};
	fastify.get("/", userSchema, async request => {
		const currentUser = auth.parse(request.headers.authorization);
		const user = await Users.getByToken(currentUser.name);
		return { data: user };
	});
};
