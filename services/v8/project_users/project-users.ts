import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

import { ProjectUsers } from "../../../db/projectUsers";
import { responseProjectUsers } from "../../../schema/schema";
import { ProjectUsersBody, ProjectUsersParams } from "../../../models/ProjectUser";

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: responseProjectUsers,
				required: ["id", "pid", "uid"]
			}
		}
	}
};

module.exports = async (fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>) => {
	const { id, at, ...projectUserPost } = responseProjectUsers;
	const projectUserPostPutSchema = {
		schema: {
			tags: ["project-users"],
			summary: "Create a project user",
			body: {
				type: "object",
				properties: {
					project_user: {
						type: "object",
						properties: projectUserPost,
						required: ["pid", "uid"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post<unknown, unknown, unknown, ProjectUsersBody>("/", projectUserPostPutSchema, async request => {
		const projectUser = await ProjectUsers.create(request.body.project_user);
		return { data: projectUser };
	});

	const projectUsersIdParam = {
		type: "object",
		properties: {
			project_user_id: {
				type: "string",
				description: "project user id"
			}
		}
	};
	const { wid, pid, uid, ...projectUserProjectPut } = projectUserPost;
	const projectUserProjectPutField = {
		...{ fields: { type: "string" } },
		...projectUserProjectPut
	};
	const projectUserPutSchema = {
		schema: {
			tags: ["project-users"],
			summary: "Update a project user",
			body: {
				type: "object",
				properties: {
					project_user: {
						type: "object",
						properties: projectUserProjectPutField
					}
				}
			},
			params: projectUsersIdParam,
			response: successfulResponse
		}
	};
	fastify.put<unknown, ProjectUsersParams, unknown, ProjectUsersBody>("/:project_user_id", projectUserPutSchema, async request => {
		const projectUser = await ProjectUsers.updateOne(request.params.project_user_id, request.body.project_user);
		return { data: projectUser };
	});

	const projectUsersDeleteSchema = {
		schema: {
			tags: ["project-users"],
			summary: "Delete a project user",
			params: projectUsersIdParam
		}
	};
	fastify.delete<unknown, ProjectUsersParams, unknown, unknown>("/:project_user_id", projectUsersDeleteSchema, async request => {
		const projectUsersIds = request.params.project_user_id.split(",");
		for (const projectUsersId of projectUsersIds) {
			await ProjectUsers.destroy(projectUsersId);
		}
		return "OK";
	});
};
