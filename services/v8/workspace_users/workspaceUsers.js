const { WorkspaceUsers } = require("../../../db/workspaceUsers");

const workspaceUsers = {
	id: {
		type: "integer"
	},
	uid: {
		type: "integer"
	},
	admin: {
		type: "boolean"
	},
	active: {
		type: "boolean"
	},
	invite_url: {
		type: "string",
		format: "uri",
		"qt-uri-protocols": ["https"]
	}
};

const {invite_url, ...workspaceUsersUpdate} = workspaceUsers;

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

module.exports = async fastify => {
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
	fastify.put("/:workspace_user_id", workspaceUsersPutSchema, async request => {
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
	fastify.delete("/:workspace_user_id", WorkspaceUsersDeleteSchema, async request => {
		await WorkspaceUsers.destroy(request.params.workspace_user_id);
		return "OK";
	});
};
