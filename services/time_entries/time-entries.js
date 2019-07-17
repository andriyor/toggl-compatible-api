const { Pool } = require('pg');

const config = {
	user: 'postgres', //this is the db user credential
	database: 'toggl_like',
	password: '18091997',
	port: 5432,
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000,
};

const pool = new Pool(config);

const responseTimeEntries = {
	id: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	pid: {
		type: "integer"
	},
	tid: {
		type: "integer"
	},
	billable: {
		type: "boolean"
	},
	start: {
		type: "string",
		format: "date-time"
	},
	duration: {
		type: "integer"
	},
	description: {
		type: "string"
	},
	at: {
		type: "string",
		format: "date-time"
	},
	tags: {
		type: "array",
		items: {
			type: "string"
		}
	}
};

const successfulResponse = {
	200: {
		type: 'object',
		properties: {
			data: {
				type: 'object',
				properties: responseTimeEntries,
				required: ["id", "duration", "start"]
			}
		}
	}
};

const {id, at, ...timeEntriesPost} = responseTimeEntries;
timeEntriesPost.created_with = {type: "string"};
const {duration, start, ...timeEntriesStart} = timeEntriesPost;


module.exports = async (fastify) => {
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
      response: successfulResponse
    }
  };
  fastify.get('/:time_entry_id', opts, async (request) => {
		const query = 'SELECT * FROM time_entries WHERE id = $1';
		const { rows } = await pool.query(query, [request.params.time_entry_id]);
		return {data: rows[0]}
  });


	const time_entries_post = {
		schema: {
			body: {
				type: 'object',
				properties: {
					time_entry: {
						type: 'object',
						properties: timeEntriesPost,
						required: ["duration", "start", "created_with"]
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post('/', time_entries_post, async (request) => {
		const query = `INSERT INTO time_entries(pid, wid, created_with, billable, start, duration, description, tags)
									 VALUES($1,$2,$3,$4,$5, $6, $7, $8) RETURNING *`;
		const values = [request.body.time_entry.pid, request.body.time_entry.wid, request.body.time_entry.created_with,
										request.body.time_entry.billable, request.body.time_entry.start, request.body.time_entry.duration,
										request.body.time_entry.description, request.body.time_entry.tags];
		const { rows } =  await pool.query(query, values);
		return {data: rows[0]}
	});



	const timeEntriesStartSchema = {
		schema: {
			body: {
				type: 'object',
				properties: {
					time_entry: {
						type: 'object',
						properties: timeEntriesStart,
						required: ['created_with']
					}
				}
			},
			response: successfulResponse
		}
	};
	fastify.post('/start', timeEntriesStartSchema, async (request) => {
		const query = `INSERT INTO time_entries(pid, wid, created_with, billable, description, tags, start, duration)
									 VALUES($1,$2,$3,$4,$5, $6, $7, $8) RETURNING *`;
		const nowDate = new Date();
		const duration = - Math.floor(nowDate / 1000);
		const values = [request.body.time_entry.pid, request.body.time_entry.wid, request.body.time_entry.created_with,
										request.body.time_entry.billable, request.body.time_entry.description,
										request.body.time_entry.tags, nowDate, duration];
		const { rows } =  await pool.query(query, values);
		return {data: rows[0]}
	});


	const timeEntryStopSchema = {
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
			response: successfulResponse
		}
	};
	fastify.put('/:time_entry_id/stop', timeEntryStopSchema, async (request) => {
		const query = 'SELECT * FROM time_entries WHERE id = $1';
		const { rows } = await pool.query(query, [request.params.time_entry_id]);

		const duration = Math.floor(Date.now() / 1000) + rows[0].duration;

		const updateOneQuery =`UPDATE time_entries SET duration=$1 WHERE id=$2 returning *`;
		const result  = await pool.query(updateOneQuery, [duration, request.params.time_entry_id]);

		return {data: result.rows[0]}
	});


	const timeEntryCurrentSchema = {
		schema: {
			response: successfulResponse
		}
	};
	fastify.get('/current', timeEntryCurrentSchema, async () => {
		const query = "SELECT * FROM time_entries WHERE duration < 0";
		const { rows } = await pool.query(query);
		return {data: rows[0]}
	});
};
