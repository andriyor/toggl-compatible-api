const { ProjectUsers } = require("../../../db/projectUsers");

const responseProjectUsers = {
	id: {
		type: "integer"
	},
	pid: {
		type: "integer"
	},
	uid: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	manager: {
		type: "boolean"
	},
	rate: {
		type: "integer"
	}
};

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

module.exports = async fastify => {
	const { id, at, ...projectUserProjectPost } = responseProjectUsers;
	const projectUserPostPutSchema = {
		schema: {
			tags: ["project-users"],
			summary: "Create a project user",
			body: {
				type: "object",
				properties: {
					project_user: {
						type: "object",
						properties: projectUserProjectPost,
						required: ["pid", "uid"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post("/", projectUserPostPutSchema, async request => {
		const projectUser = await ProjectUsers.create(request.body.project_user);
		return { data: projectUser };
	});
};
