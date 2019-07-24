const auth = require("basic-auth");
const { Users } = require("../../../db/users");
const { Workspaces } = require("../../../db/workspaces");

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

const successfulResponse = {
	200: {
		type: "array",
		items: {
			type: "object",
			properties: responseWorkspace
		}
	}
};

module.exports = async fastify => {
	const workspacesSchema = {
		schema: {
			tags: ["workspaces"],
			summary: "Get workspaces",
			response: successfulResponse
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
};
