const { Pool } = require('pg');
const faker = require('faker');

const config = {
	user: 'postgres', //this is the db user credential
	database: 'toggl_like',
	password: '18091997',
	port: 5432,
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000,
};

const pool = new Pool(config);


module.exports = async function (fastify, opt) {
  const opts = {
    schema: {
			params: {
				type: 'object',
				properties: {
					time_entry_id: {
						type: 'string',
						description: 'time entry id'
					}
				}
			},
      response: {
        200: {
          type: 'object',
          properties: {
						id: {type: 'integer'},
						student_name: {type: 'string'},
						student_age: {type: 'integer'},
						student_class: {type: 'string'},
						parent_contact: {type: 'string'},
						admission_date: {type: 'string'}
          }
        }
      }
    }
  };
  fastify.get('/api/v8/time_entries/:time_entry_id', opts, async function (request, reply) {
		const query = 'SELECT * FROM students WHERE id = $1';
		const { rows } = await pool.query(query, [request.params.time_entry_id]);
  	return rows[0]
  });
};

