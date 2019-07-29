const { ProjectUsers } = require("../../../db/projectUsers");
const { responseProjectUsers } = require("../../../schema/schema");

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
	fastify.post("/", projectUserPostPutSchema, async request => {
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
	fastify.put("/:project_user_id", projectUserPutSchema, async request => {
		const projectUser = await ProjectUsers.updateOne(
			request.params.project_user_id,
			request.body.project_user
		);
		return { data: projectUser };
	});

	const projectUsersDeleteSchema = {
		schema: {
			tags: ["project-users"],
			summary: "Delete a project user",
			params: projectUsersIdParam
		}
	};
	fastify.delete("/:project_user_id", projectUsersDeleteSchema, async request => {
		const projectUsersIds = request.params.project_user_id.split(",");
		for (projectUsersId of projectUsersIds) {
			await ProjectUsers.destroy(projectUsersId);
		}
		return "OK";
	});
};
