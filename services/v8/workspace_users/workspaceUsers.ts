import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

import {WorkspaceUserParams, WorkspaceUsersBody} from "../../../models/WorkspaceUser";
import { WorkspaceUsers } from "../../../db/workspaceUsers";
import { responseWorkspaceUsers } from "../../../schema/schema";

const { invite_url, ...workspaceUsersUpdate } = responseWorkspaceUsers;

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: workspaceUsersUpdate
			}
		}
	}
};

module.exports = async (fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>) => {
	const { id, ...workspaceUsersPost } = workspaceUsersUpdate;
	const workspaceUsersIdParam = {
		type: "object",
		properties: {
			workspace_user_id: {
				type: "string",
				description: "workspace_users id"
			}
		}
	};
	const workspaceUsersPutSchema = {
		schema: {
			tags: ["workspace-users"],
			summary: "Update workspace user",
			body: {
				type: "object",
				properties: {
					workspace_user: {
						type: "object",
						properties: workspaceUsersPost
					}
				}
			},
			params: workspaceUsersIdParam,
			response: successfulResponse
		}
	};
	fastify.put<unknown, WorkspaceUserParams, unknown, WorkspaceUsersBody>("/:workspace_user_id", workspaceUsersPutSchema, async request => {
		const task = await WorkspaceUsers.updateOne(request.params.workspace_user_id, request.body.workspace_user);
		return { data: task };
	});

	const WorkspaceUsersDeleteSchema = {
		schema: {
			tags: ["workspace-users"],
			summary: "Delete workspace user",
			params: workspaceUsersIdParam
		}
	};
	fastify.delete<unknown, WorkspaceUserParams, unknown, unknown>("/:workspace_user_id", WorkspaceUsersDeleteSchema, async request => {
		await WorkspaceUsers.destroy(request.params.workspace_user_id);
		return "OK";
	});
};
