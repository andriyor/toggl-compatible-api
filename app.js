const path = require('path');
const AutoLoad = require('fastify-autoload');

module.exports = function (fastify, opts, next) {
  // Place here your custom code!

	fastify.register(require('fastify-swagger'), {
		swagger: {
			info: {
				title: 'Test swagger',
				description: 'testing the fastify swagger api',
				version: '0.1.0'
			},
			host: 'localhost:3000',
			schemes: ['http'],
			consumes: ['application/json'],
			produces: ['application/json']
		},
		exposeRoute: true
	});

	// Do not touch the following lines

	// This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  });

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services'),
    options: Object.assign({}, opts)
  });

  // Make sure to call next when done
  next()
};
