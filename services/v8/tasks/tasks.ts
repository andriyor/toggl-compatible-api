import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

import { Tasks } from "../../../db/tasks";
import { TaskBody, TaskParams } from "../../../models/Task";
import { responseTask } from "../../../schema/schema";

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

module.exports = async (fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>) => {
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
	fastify.post<unknown, unknown, unknown, TaskBody>("/", taskPostPutSchema, async (request, reply) => {
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
	fastify.get<unknown, TaskParams, unknown, unknown>("/:task_id", taskByIdSchema, async request => {
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
						properties: taskPost
					}
				}
			},
			params: taskIdParam,
			response: successfulResponse
		}
	};
	fastify.put<unknown, TaskParams, unknown, TaskBody>("/:task_id", taskPuttSchema, async request => {
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
	fastify.delete<unknown, TaskParams, unknown, unknown>("/:task_id", taskDeleteSchema, async request => {
		const taskIds = request.params.task_id.split(",");
		for (const taskId of taskIds) {
			await Tasks.destroy(taskId);
		}
		return "OK";
	});
};
