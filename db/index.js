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
    billable BOOLEAN,
    start TIMESTAMP,
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
			billable: faker.random.boolean(),
			start: faker.date.future(0.1),
			duration: faker.random.number(100),
			description: faker.random.words(),
		};
		const query = `INSERT INTO time_entries(pid, wid, billable, start, duration, description)
									 VALUES($1,$2,$3,$4,$5, $6) RETURNING *`;
		const values = [data.pid, data.wid, data.billable, data.start, data.duration, data.description];
		await pool.query(query, values);
	}
	//
	const query = 'SELECT * FROM time_entries WHERE id = 274';
	const { rows } = await pool.query(query);
	console.log(rows[0]);

	await pool.end();
})();