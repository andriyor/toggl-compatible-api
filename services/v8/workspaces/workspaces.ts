import {WorkspaceBody, WorkspaceParams} from "../../../models/Workspace";

const auth = require("basic-auth");
import fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

import { Users } from "../../../db/users";
import { Workspaces } from "../../../db/workspaces";
import { responseUser } from "../../../schema/schema";
import { responseClient } from "../../../schema/schema";
import { responseGroup } from "../../../schema/schema";
import { responseProject } from "../../../schema/schema";
import { responseTask } from "../../../schema/schema";
import { responseTag } from "../../../schema/schema";
import { responseProjectUsers } from "../../../schema/schema";
import { responseWorkspaceUsers } from "../../../schema/schema";
import {ActiveQuery} from "../../../models/ActiveQuery";

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

module.exports = async (fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>) => {
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
	fastify.get<unknown, WorkspaceParams, any, unknown>("/:workspace_id", workspaceByIdSchema, async (request, reply) => {
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
	fastify.put<unknown, WorkspaceParams, unknown, WorkspaceBody>("/:workspace_id", updateWorkspaceSchema, async request => {
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
	fastify.get<unknown, WorkspaceParams, unknown, unknown>("/:workspace_id/users", getWorkspaceUsers, async request => {
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
	fastify.get<unknown, WorkspaceParams, unknown, unknown>("/:workspace_id/clients", getWorkspaceClients, async request => {
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
	fastify.get<unknown, WorkspaceParams, unknown, unknown>("/:workspace_id/groups", getWorkspaceGroups, async request => {
		return await Workspaces.getWorkspaceGroupsByWorkspaceId(request.params.workspace_id);
	});

	const { template_id, color, ...responseWorkspaceProjects } = responseProject;
	const getWorkspaceProjects = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspace projects",
			params: workspaceIdParam,
			querystring: {
				active: {
					enum: ["true", "false", "both"]
				}
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
	fastify.get<ActiveQuery, WorkspaceParams, unknown, unknown>("/:workspace_id/projects", getWorkspaceProjects, async request => {
		if (request.query.active === "both") {
			return await Workspaces.getWorkspaceProjects(request.params.workspace_id);
		}
		return await Workspaces.getWorkspaceProjectsByActive(request.params.workspace_id, request.query.active);
	});

	const getWorkspaceTasks = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspace tasks",
			params: workspaceIdParam,
			querystring: {
				active: {
					enum: ["true", "false", "both"]
				}
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
	fastify.get<ActiveQuery, WorkspaceParams, unknown, unknown>("/:workspace_id/tasks", getWorkspaceTasks, async request => {
		if (request.query.active === "both") {
			return await Workspaces.getWorkspaceTasks(request.params.workspace_id);
		}
		return await Workspaces.getWorkspaceTasksByActive(request.params.workspace_id, request.query.active);
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
	fastify.get<ActiveQuery, WorkspaceParams, unknown, unknown>("/:workspace_id/tags", getWorkspaceTags, async request => {
		return await Workspaces.getWorkspaceTags(request.params.workspace_id);
	});

	const getWorkspaceProjectUsers = {
		schema: {
			tags: ["workspaces"],
			summary: "Get list of project users in a Workspace",
			params: workspaceIdParam,
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseProjectUsers
					}
				}
			}
		}
	};
	fastify.get<unknown, WorkspaceParams, unknown, unknown>("/:workspace_id/project_users", getWorkspaceProjectUsers, async request => {
		return await Workspaces.getWorkspaceProjectUsers(request.params.workspace_id);
	});

	const userFields = {
		email: {
			type: "string"
		},
		name: {
			type: "string"
		},
		at: {
			type: "string",
			format: "date-time"
		}
	};
	const workspaceUsers = { ...responseWorkspaceUsers, ...userFields };
	const getWorkspaceWorkspaceUsers = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspace users",
			params: workspaceIdParam,
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: workspaceUsers
					}
				}
			}
		}
	};
	fastify.get<unknown, WorkspaceParams, unknown, unknown>("/:workspace_id/workspace_users", getWorkspaceWorkspaceUsers, async request => {
		return await Workspaces.getWorkspaceWorkspaceUsers(request.params.workspace_id);
	});
};
