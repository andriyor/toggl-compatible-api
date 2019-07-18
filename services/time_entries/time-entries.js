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
	duronly: {
		type: "boolean"
	},
	start: {
		type: "string",
		format: "date-time"
	},
	stop: {
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
const {duration, start, stop, ...timeEntriesStart} = timeEntriesPost;


async function getRunningTimeEntries() {
	const runningTimeEntryQuery = "SELECT * FROM time_entries WHERE stop IS NULL";
	const { rows } = await pool.query(runningTimeEntryQuery);
	return rows;
}

async function stopTimeEntry(duration, timeEntryId) {
	const nowDate = new Date();
	const newDuration = Math.floor(nowDate / 1000) + duration;

	const updateOneQuery =`UPDATE time_entries SET duration=$1, stop=$2 WHERE id=$3 returning *`;
	return await pool.query(updateOneQuery, [newDuration, nowDate, timeEntryId]);
}

function getValues(time_entry) {
	return [time_entry.pid, time_entry.wid, time_entry.created_with, time_entry.billable, time_entry.duronly,
					time_entry.start, time_entry.stop, new Date(), time_entry.duration, time_entry.description, time_entry.tags];
}


module.exports = async (fastify) => {

	const timeEntryIdParam = {
		type: 'object',
		properties: {
			time_entry_id: {
				type: 'string',
				description: 'time entry id'
			}
		}
	};

  const timeEntryByIDSchema = {
    schema: {
			params: timeEntryIdParam,
      response: successfulResponse
    }
  };
  fastify.get('/:time_entry_id', timeEntryByIDSchema, async (request) => {
		const query = 'SELECT * FROM time_entries WHERE id = $1';
		const { rows } = await pool.query(query, [request.params.time_entry_id]);
		return {data: rows[0]}
  });


	const timeEntriesPostPutSchema = {
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
	fastify.post('/', timeEntriesPostPutSchema, async (request) => {
		const query = `INSERT INTO time_entries(pid, wid, created_with, billable, duronly,
                         										start, stop, at, duration, description, tags)
									 VALUES($1,$2,$3,$4,$5, $6, $7, $8, $9, $10, $11) RETURNING *`;
		const values = getValues(request.body.time_entry);
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
		const runningTimeEntries = await getRunningTimeEntries();
		if (runningTimeEntries.length) {
			await stopTimeEntry(runningTimeEntries[0].duration, runningTimeEntries[0].id);
		}

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
			params: timeEntryIdParam,
			response: successfulResponse
		}
	};
	fastify.put('/:time_entry_id/stop', timeEntryStopSchema, async (request) => {
		const query = 'SELECT * FROM time_entries WHERE id = $1';
		const { rows } = await pool.query(query, [request.params.time_entry_id]);
		if (rows[0].stop) {
			return "Time entry already stopped";
		}
		const result = await stopTimeEntry(rows[0].duration, request.params.time_entry_id);
		return {data: result.rows[0]}
	});


	const timeEntryCurrentSchema = {
		schema: {
			response: successfulResponse
		}
	};
	fastify.get('/current', timeEntryCurrentSchema, async () => {
		const runningTimeEntries = await getRunningTimeEntries();
		return {data: runningTimeEntries[0]}
	});


	const updateTimeEntrySchema = {schema: {...timeEntriesPostPutSchema.schema, params: timeEntryIdParam}};
	fastify.put('/:time_entry_id', updateTimeEntrySchema, async (request) => {
		const updateOneQuery =`UPDATE time_entries SET pid=$1, wid=$2, created_with=$3, billable=$4,
                                                   duronly=$5, start=$6, stop=$7, at=$8, duration=$9, 
                        												   description=$10, tags=$11 
																								WHERE id=$12 returning *`;
		const values = getValues(request.body.time_entry);
		const {rows} = await pool.query(updateOneQuery, [...values, request.params.time_entry_id]);
		return {data: rows[0]}
	});
};
