const auth = require("basic-auth");

const { Users } = require("../../../db/users");
const { Workspaces } = require("../../../db/workspaces");
const { responseUser } = require("../../../schema/schema");
const { responseClient } = require("../../../schema/schema");
const { responseGroup } = require("../../../schema/schema");
const { responseProject } = require("../../../schema/schema");
const { responseTask } = require("../../../schema/schema");
const { responseTag } = require("../../../schema/schema");

const responseWorkspace = {
	id: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	premium: {
		type: "boolean"
	},
	admin: {
		type: "boolean"
	},
	default_hourly_rate: {
		type: "integer"
	},
	default_currency: {
		type: "string"
	},
	only_admins_may_create_projects: {
		type: "boolean"
	},
	only_admins_see_billable_rates: {
		type: "boolean"
	},
	rounding: {
		type: "integer"
	},
	rounding_minutes: {
		type: "integer"
	},
	at: {
		type: "string"
	},
	logo_url: {
		type: "string"
	}
};

module.exports = async fastify => {
	const workspacesSchema = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspaces",
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseWorkspace
					}
				}
			}
		}
	};
	fastify.get("/", workspacesSchema, async (request, reply) => {
		const user = auth.parse(request.headers.authorization);
		const users = await Users.findByUsername(user.name);
		if (!users.length || users.password !== users.password) {
			reply.code(403).send();
		} else {
			return await Workspaces.getWorkspacesByUserId(users[0].id);
		}
	});

	const workspaceIdParam = {
		type: "object",
		properties: {
			workspace_id: {
				type: "string",
				description: "workspace id"
			}
		}
	};

	const workspaceByIdSchema = {
		schema: {
			tags: ["workspaces"],
			summary: "Get single workspace",
			params: workspaceIdParam,
			response: {
				200: {
					type: "object",
					properties: {
						data: {
							type: "object",
							properties: responseWorkspace
						}
					}
				}
			}
		}
	};
	fastify.get("/:workspace_id", workspaceByIdSchema, async (request, reply) => {
		const user = auth.parse(request.headers.authorization);
		const users = await Users.findByUsername(user.name);
		if (!users.length || users.password !== users.password) {
			reply.code(404).send();
		} else {
			const workspace = await Workspaces.getById(request.params.workspace_id);
			return { data: workspace };
		}
	});

	const { id, at, ...workspacePut } = responseWorkspace;
	const workspacePutSchema = {
		schema: {
			summary: "Update workspace",
			body: {
				type: "object",
				properties: {
					workspace: {
						type: "object",
						properties: workspacePut
					}
				}
			},
			response: {
				200: {
					type: "object",
					properties: {
						data: {
							type: "object",
							properties: responseWorkspace
						}
					}
				}
			}
		}
	};
	const updateWorkspaceSchema = {
		schema: {
			tags: ["workspaces"],
			params: workspaceIdParam,
			...workspacePutSchema.schema,
			summary: "Update workspace"
		}
	};
	fastify.put("/:workspace_id", updateWorkspaceSchema, async request => {
		await Workspaces.updateOne(request.body.workspace, request.params.workspace_id);
		const workspace = await Workspaces.getById(request.params.workspace_id);
		return { data: workspace };
	});

	const getWorkspaceUsers = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspace users",
			params: workspaceIdParam,
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseUser
					}
				}
			}
		}
	};
	fastify.get("/:workspace_id/users", getWorkspaceUsers, async request => {
		return await Workspaces.getWorkspaceUsersByWorkspaceId(request.params.workspace_id);
	});

	const workspaceSchema = {
		hrate: {
			type: "integer"
		},
		cur: {
			type: "string"
		}
	};
	const clientsSchema = { ...responseClient, ...workspaceSchema };
	const getWorkspaceClients = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspace clients",
			params: workspaceIdParam,
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: clientsSchema
					}
				}
			}
		}
	};
	fastify.get("/:workspace_id/clients", getWorkspaceClients, async request => {
		return await Workspaces.getWorkspaceClientsByWorkspaceId(request.params.workspace_id);
	});

	const getWorkspaceGroups = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspace groups",
			params: workspaceIdParam,
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseGroup
					}
				}
			}
		}
	};
	fastify.get("/:workspace_id/groups", getWorkspaceGroups, async request => {
		return await Workspaces.getWorkspaceGroupsByWorkspaceId(request.params.workspace_id);
	});

	const { template_id, color, ...responseWorkspaceProjects } = responseProject;
	const getWorkspaceProjects = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspace projects",
			params: workspaceIdParam,
			querystring: {
				active: { type: "string" }
			},
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseWorkspaceProjects
					}
				}
			}
		}
	};
	fastify.get("/:workspace_id/projects", getWorkspaceProjects, async request => {
		if (request.query.active === "both") {
			return await Workspaces.getWorkspaceProjects(request.params.workspace_id);
		}
		return await Workspaces.getWorkspaceProjectsByActive(
			request.params.workspace_id,
			request.query.active
		);
	});

	const getWorkspaceTasks = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspace tasks",
			params: workspaceIdParam,
			querystring: {
				active: { type: "string" }
			},
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseTask
					}
				}
			}
		}
	};
	fastify.get("/:workspace_id/tasks", getWorkspaceTasks, async request => {
		if (request.query.active === "both") {
			return await Workspaces.getWorkspaceTasks(request.params.workspace_id);
		}
		return await Workspaces.getWorkspaceTasksByActive(
			request.params.workspace_id,
			request.query.active
		);
	});

	const getWorkspaceTags = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspace tags",
			params: workspaceIdParam,
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseTag
					}
				}
			}
		}
	};
	fastify.get("/:workspace_id/tags", getWorkspaceTags, async request => {
		return await Workspaces.getWorkspaceTagsByActive(
			request.params.workspace_id,
			request.query.active
		);
	});
};
