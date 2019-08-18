import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

const { Tags } = require("../../../db/tags");

const { responseTag } = require("../../../schema/schema");

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

module.exports = async (
	fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>
) => {
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
		try {
			const tag = await Tags.create(request.body.tag);
			return { data: tag };
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
		const tag = await Tags.updateOne(request.params.tag_id, request.body.tag);
		return { data: tag };
	});

	const projectDeleteSchema = {
		schema: {
			tags: ["tag"],
			summary: "Delete a tag",
			params: tagIdParam
		}
	};
	fastify.delete("/:tag_id", projectDeleteSchema, async request => {
		await Tags.destroy(request.params.tag_id);
		return "OK";
	});
};
