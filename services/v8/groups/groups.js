const { Groups } = require("../../../db/groups");

const groupsResponse = {
	id: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	wid: {
		type: "integer"
	},
	at: {
		type: "string"
	}
};

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: groupsResponse,
				required: ["id", "wid", "name"]
			}
		}
	}
};

module.exports = async fastify => {
	const { id, ...groupPost } = groupsResponse;
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
	fastify.post("/", groupPostPutSchema, async (request, reply) => {
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
	fastify.put("/:group_id", updateTagSchema, async request => {
		const group = await Groups.updateOne(
			request.params.group_id,
			request.body.group
		);
		return { data: group };
	});
};
