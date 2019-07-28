const { Tasks } = require("../../../db/tasks");

const responseTask = {
	id: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	wid: {
		type: "integer"
	},
	pid: {
		type: "integer"
	},
	uid: {
		type: "integer"
	},
	estimated_seconds: {
		type: "integer"
	},
	active: {
		type: "boolean"
	},
	at: {
		type: "string"
	},
	tracked_seconds: {
		type: "integer"
	}
};

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: responseTask,
				required: ["id", "pid", "name"]
			}
		}
	}
};

module.exports = async fastify => {
	const { id, ...taskPost } = responseTask;
	const taskPostPutSchema = {
		schema: {
			tags: ["tasks"],
			summary: "Create a task",
			body: {
				type: "object",
				properties: {
					task: {
						type: "object",
						properties: taskPost,
						required: ["name", "wid"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post("/", taskPostPutSchema, async (request, reply) => {
		try {
			const group = await Tasks.create(request.body.task);
			return { data: group };
		} catch (e) {
			if (e.code === "23505") {
				reply.code(400).send("Name has already been taken");
			}
		}
	});

};
