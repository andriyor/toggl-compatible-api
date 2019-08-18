const path = require("path");
const AutoLoad = require("fastify-autoload");
const { Users } = require("./db/me");
import fastify from 'fastify'
import { IncomingMessage, Server, ServerResponse } from 'http'

module.exports = function(fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> , opts: any, next: Function) {
	// Place here your custom code!

	const authenticate = { realm: "Westeros" };
	fastify.register(require("fastify-basic-auth"), { validate, authenticate });
	async function validate(username: string, password: string) {
		const user = await Users.getByToken(username);
		if (!user || (password !== "api_token" && user.api_token !== username)) {
			return new Error("Unauthorized");
		}
	}

	fastify.register(require("fastify-swagger"), {
		swagger: {
			info: {
				title: "Toggl compatible API Documentation",
				description: "Toggl compatible API Documentation",
				version: "0.1.0"
			},
			host: "localhost:3000",
			schemes: ["http"],
			consumes: ["application/json"],
			produces: ["application/json"],
			tags: [
				{ name: "time-entries", description: "Time Entries" },
				{ name: "projects", description: "Projects" },
				{ name: "user", description: "Users" },
				{ name: "project-users", description: "Project users" },
				{ name: "tag", description: "Tags" },
				{ name: "workspaces", description: "Workspaces" },
				{ name: "clients", description: "Clients" },
				{ name: "groups", description: "Groups" },
				{ name: "tasks", description: "Tasks" },
				{ name: "workspace-users", description: "Workspace Users" }
			],
			securityDefinitions: {
				basicAuth: {
					type: "basic"
				}
			},
			security: [
				{
					basicAuth: []
				}
			]
		},
		exposeRoute: true
	});

	// Do not touch the following lines

	// This loads all plugins defined in plugins
	// those should be support plugins that are reused
	// through your application
	fastify.register(AutoLoad, {
		dir: path.join(__dirname, "plugins"),
		options: Object.assign({}, opts)
	});

	// This loads all plugins defined in services
	// define your routes in one of these
	opts.prefix = "/api/v8/";
	fastify.register(AutoLoad, {
		dir: path.join(__dirname, "services/v8"),
		options: Object.assign({}, opts)
	});

	// opts.prefix = "/api/v9/";
	// fastify.register(AutoLoad, {
	// 	dir: path.join(__dirname, "services/v9"),
	// 	options: Object.assign({}, opts)
	// });

	// fastify.after(() => {
	// 	@ts-ignore
	// 	fastify.addHook("preHandler", fastify.basicAuth);
	// });

	// Make sure to call next when done
	next();
};
