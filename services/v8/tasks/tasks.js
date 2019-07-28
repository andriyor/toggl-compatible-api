const { Tasks } = require("../../../db/tasks");
const { responseTask } = require("../../../schema/schema");

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
	const { id, at, ...taskPost } = responseTask;
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

	const taskIdParam = {
		type: "object",
		properties: {
			task_id: {
				type: "string",
				description: "task id"
			}
		}
	};
	const taskByIdSchema = {
		schema: {
			tags: ["tasks"],
			summary: "Get task details",
			params: taskIdParam,
			response: successfulResponse
		}
	};
	fastify.get("/:task_id", taskByIdSchema, async request => {
		const task = await Tasks.findByID(request.params.task_id);
		return { data: task };
	});

	const taskPuttSchema = {
		schema: {
			tags: ["tasks"],
			summary: "Update a task",
			body: {
				type: "object",
				properties: {
					task: {
						type: "object",
						properties: taskPost,
						required: ["name"]
					}
				}
			},
			params: taskIdParam,
			response: successfulResponse
		}
	};
	fastify.put("/:task_id", taskPuttSchema, async request => {
		const task = await Tasks.updateOne(request.params.task_id, request.body.task);
		return { data: task };
	});

	const taskDeleteSchema = {
		schema: {
			tags: ["tasks"],
			summary: "Delete a task",
			params: taskIdParam
		}
	};
	fastify.delete("/:task_id", taskDeleteSchema, async request => {
		const taskIds = request.params.task_id.split(',');
		for (taskId of taskIds) {
			await Tasks.destroy(taskId);
		}
		return "OK";
	});
};