const {Pool} = require('pg');
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
                              time_entries
                          (
                              id           SERIAL PRIMARY KEY,
                              pid          INT,
                              wid          INT,
                              tid          INT,
                              created_with VARCHAR(128),
                              billable     BOOLEAN,
                              duronly      BOOLEAN,
                              start        TIMESTAMP,
                              stop         TIMESTAMP,
                              at           TIMESTAMP,
                              duration     INT,
                              tags         text[],
                              description  VARCHAR(128)
                          )`;

const timeProjectsTable = `CREATE TABLE IF NOT EXISTS
                               projects
                           (
                               id              SERIAL PRIMARY KEY,
                               wid             INT,
                               cid             INT,
                               active          BOOLEAN,
                               is_private      BOOLEAN,
                               template        BOOLEAN,
                               template_id     INT,
                               billable        BOOLEAN,
                               auto_estimates  BOOLEAN,
                               estimated_hours INT,
                               at              TIMESTAMP,
                               color           INTEGER,
                               rate            FLOAT
                           )`;


(async () => {
	await pool.query(timeEntriesTable);
	await pool.query(timeProjectsTable);
	for (let i = 0; i < 10; i++) {
		const timeEntryData = {
			pid: faker.random.number(100),
			wid: faker.random.number(100),
			tid: faker.random.number(100),
			tags: [faker.random.word(), faker.random.word()],
			created_with: faker.random.word(),
			billable: faker.random.boolean(),
			duronly: faker.random.boolean(),
			start: faker.date.future(0.1),
			stop: faker.date.future(0.1),
			at: faker.date.future(0.1),
			duration: faker.random.number({min: 100, max: 1000}),
			description: faker.random.words(),
		};

		const CreateTimeEntryQuery = `INSERT INTO time_entries(pid, wid, tid, created_with, billable, duronly, start, stop,
                                                           at, duration, description, tags)
                                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;
		const timeEntryValues = [timeEntryData.pid, timeEntryData.wid, timeEntryData.tid, timeEntryData.created_with,
			timeEntryData.billable, timeEntryData.duronly, timeEntryData.start, timeEntryData.stop,
			timeEntryData.at, timeEntryData.duration, timeEntryData.description, timeEntryData.tags];
		await pool.query(CreateTimeEntryQuery, timeEntryValues);


		const projectData = {
			wid: faker.random.number(100),
			cid: faker.random.number(100),
			active: faker.random.boolean(),
			is_private: faker.random.boolean(),
			template: faker.random.boolean(),
			template_id: faker.random.number(100),
			billable: faker.random.boolean(),
			auto_estimates: faker.random.boolean(),
			estimated_hours: faker.random.number(100),
			at: faker.date.future(0.1),
			color: faker.random.number(100),
			rate: faker.random.float()
		};

		const createProjectQuery = `INSERT INTO projects(wid, cid, active, is_private, template, template_id,
                                                     billable, auto_estimates, estimated_hours, at, color, rate)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;
		const projectValues = [projectData.wid, projectData.cid, projectData.active, projectData.is_private,
			projectData.template, projectData.template_id, projectData.billable, projectData.auto_estimates,
			projectData.estimated_hours, projectData.at, projectData.color, projectData.rate];
		await pool.query(createProjectQuery, projectValues);

	}

	await pool.end();
})();
