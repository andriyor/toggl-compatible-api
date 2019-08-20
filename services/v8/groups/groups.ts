import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

import { GroupBody, GroupParams } from "../../../models/Group";
import { Groups } from "../../../db/groups";
import { responseGroup } from "../../../schema/schema";

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: responseGroup,
				required: ["id", "wid", "name"]
			}
		}
	}
};

module.exports = async (fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>) => {
	const { id, ...groupPost } = responseGroup;
	const groupPostPutSchema = {
		schema: {
			tags: ["groups"],
			summary: "Create a group",
			body: {
				type: "object",
				properties: {
					group: {
						type: "object",
						properties: groupPost,
						required: ["name", "wid"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post<unknown, unknown, unknown, GroupBody>("/", groupPostPutSchema, async (request, reply) => {
		try {
			const group = await Groups.create(request.body.group);
			return { data: group };
		} catch (e) {
			if (e.code === "23505") {
				reply.code(400).send("Name has already been taken");
			}
		}
	});

	const { at, wid, ...groupPut } = groupPost;
	const groupIdParam = {
		type: "object",
		properties: {
			group_id: {
				type: "string",
				description: "group id"
			}
		}
	};
	const updateTagSchema = {
		schema: {
			tags: ["groups"],
			summary: "Update a group",
			params: groupIdParam,
			body: {
				type: "object",
				properties: {
					group: {
						type: "object",
						properties: groupPut,
						required: ["name"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.put<unknown, GroupParams, unknown, GroupBody>("/:group_id", updateTagSchema, async request => {
		const group = await Groups.updateOne(request.params.group_id, request.body.group);
		return { data: group };
	});

	const groupDeleteSchema = {
		schema: {
			tags: ["groups"],
			summary: "Delete a group",
			params: groupIdParam
		}
	};
	fastify.delete<unknown, GroupParams, unknown, unknown>("/:group_id", groupDeleteSchema, async request => {
		await Groups.destroy(request.params.group_id);
		return "OK";
	});
};
