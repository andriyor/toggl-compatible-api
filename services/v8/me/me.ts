import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { AuthorizationHeader } from "../../../models/AuthorizationHeader";
import auth from "basic-auth";

import { Users } from "../../../db/me";
import { responseUser } from "../../../schema/schema";

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

module.exports = async (fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>) => {
	const userSchema = {
		schema: {
			tags: ["user"],
			summary: "Get current user data",
			response: successfulResponse
		}
	};
	fastify.get<unknown, unknown, AuthorizationHeader, unknown>("/", userSchema, async request => {
		const currentUser = auth.parse(request.headers.authorization);
		// @ts-ignore
		const user = await Users.getByToken(currentUser.name);
		return { data: user };
	});
};
