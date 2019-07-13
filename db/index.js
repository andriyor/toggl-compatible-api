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
			name: faker.name.firstName(0),
				age: faker.random.number(100),
				classroom: faker.random.word(),
				parents: faker.random.word(),
				admission: faker.random.word()
		};
		const query = `INSERT INTO students(student_name,student_age, student_class, parent_contact, admission_date)
									 VALUES($1,$2,$3,$4,$5) RETURNING *`;
		const values = [data.name, data.age, data.classroom, data.parents, data.admission];
		await pool.query(query, values);
	}
	//
	// const query = 'SELECT * FROM students WHERE id = 274';
	// const { rows } = await pool.query(query);
	// console.log(rows[0]);

	await pool.end();
})();