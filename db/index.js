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

const timeEntriesTable = `CREATE TABLE IF NOT EXISTS
	time_entries(
    id SERIAL PRIMARY KEY,
    pid INT,
    wid INT,
    tid INT,
    created_with VARCHAR(128),
    billable BOOLEAN,
    start TIMESTAMP,
    stop TIMESTAMP,
    at TIMESTAMP,
    duration INT,
    tags text[],
    description VARCHAR(128)
  )`;


(async () => {
	await pool.query(timeEntriesTable);
	for (let i = 0; i < 10; i++) {
		const data = {
			pid: faker.random.number(100),
			wid: faker.random.number(100),
			tid: faker.random.number(100),
			tags: [faker.random.word(), faker.random.word()],
			created_with: faker.random.word(),
			billable: faker.random.boolean(),
			start: faker.date.future(0.1),
			stop: faker.date.future(0.1),
			at: faker.date.future(0.1),
			duration: faker.random.number({min: 100, max:1000 }),
			description: faker.random.words(),
		};

		const query = `INSERT INTO time_entries(pid, wid, tid, created_with, billable, start, stop, at, duration, description, tags)
									 VALUES($1,$2,$3,$4,$5, $6, $7, $8, $9, $10, $11) RETURNING *`;
		const values = [data.pid, data.wid, data.tid, data.created_with, data.billable, data.start, data.stop,
										data.at, data.duration, data.description, data.tags];
		await pool.query(query, values);
	}

	await pool.end();
})();
