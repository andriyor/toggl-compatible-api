const { pool } = require("../../../db/db");
const { Clients } = require("../../../db/clients");

const responseClient = {
	id: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	notes: {
		type: "string"
	},
	at: {
		type: "string",
		format: "date-time"
	}
};

const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: responseClient,
				required: ["id", "wid", "name"]
			}
		}
	}
};

module.exports = async fastify => {
	const { id, at, ...clientPost } = responseClient;
	const clientPostPutSchema = {
		schema: {
			tags: ["clients"],
			summary: "Create a client",
			body: {
				type: "object",
				properties: {
					client: {
						type: "object",
						properties: clientPost,
						required: ["name", "wid"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post("/", clientPostPutSchema, async request => {
		const client = await Clients.create(request.body.client);
		return { data: client };
	});

	const clientIdParam = {
		type: "object",
		properties: {
			client_id: {
				type: "string",
				description: "client id"
			}
		}
	};
	const clientByIdSchema = {
		schema: {
			tags: ["clients"],
			summary: "Get client details",
			params: clientIdParam,
			response: successfulResponse
		}
	};
	fastify.get("/:client_id", clientByIdSchema, async request => {
		const client = await Clients.findByID(request.params.client_id);
		return { data: client };
	});
};
