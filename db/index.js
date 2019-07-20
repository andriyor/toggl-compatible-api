const { Pool } = require("pg");
const faker = require("faker");

const config = {
	user: "postgres", //this is the db user credential
	database: "toggl_like",
	password: "18091997",
	port: 5432,
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000
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

const projectsTable = `CREATE TABLE IF NOT EXISTS
                           projects
                       (
                           id              SERIAL PRIMARY KEY,
                           name            VARCHAR(128) UNIQUE,
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
                           color           VARCHAR(128),
                           rate            FLOAT
                       )`;

const usersTable = `CREATE TABLE IF NOT EXISTS
                        users
                    (
                        id                        SERIAL PRIMARY KEY,
                        api_token                 VARCHAR(128),
                        default_wid               INT,
                        email                     VARCHAR(128) UNIQUE,
                        fullname                  VARCHAR(128),
                        password                  VARCHAR(128),
                        jquery_timeofday_format   VARCHAR(128),
                        jquery_date_format        VARCHAR(128),
                        timeofday_format          VARCHAR(128),
                        date_format               VARCHAR(128),
                        store_start_and_stop_time BOOLEAN,
                        beginning_of_week         INT,
                        language                  VARCHAR(128),
                        image_url                 VARCHAR(512),
                        sidebar_piechart          BOOLEAN,
                        at                        TIMESTAMP,
                        retention                 INT,
                        record_timeline           BOOLEAN,
                        render_timeline           BOOLEAN,
                        timeline_enabled          BOOLEAN,
                        timeline_experiment       BOOLEAN
                    )`;

const projectUsersTable = `CREATE TABLE IF NOT EXISTS
                               project_users
                           (
                               id      SERIAL PRIMARY KEY,
                               pid     INT NOT NULL,
                               uid     INT NOT NULL,
                               FOREIGN KEY (pid) REFERENCES projects (id),
                               FOREIGN KEY (uid) REFERENCES users (id),
                               wid     INT,
                               manager BOOLEAN,
                               rate    FLOAT,
                               at      TIMESTAMP
                           )`;

(async () => {
	await pool.query(timeEntriesTable);
	await pool.query(projectsTable);
	await pool.query(usersTable);
	await pool.query(projectUsersTable);

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
			duration: faker.random.number({ min: 100, max: 1000 }),
			description: faker.random.words()
		};

		const createTimeEntryQuery = `INSERT INTO time_entries(pid, wid, tid, created_with, billable, duronly, start,
                                                           stop, at, duration, description, tags)
                                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;
		const timeEntryValues = [
			timeEntryData.pid,
			timeEntryData.wid,
			timeEntryData.tid,
			timeEntryData.created_with,
			timeEntryData.billable,
			timeEntryData.duronly,
			timeEntryData.start,
			timeEntryData.stop,
			timeEntryData.at,
			timeEntryData.duration,
			timeEntryData.description,
			timeEntryData.tags
		];
		await pool.query(createTimeEntryQuery, timeEntryValues);

		const projectData = {
			name: faker.random.words(),
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
			color: faker.random.number(100).toString(),
			rate: faker.random.float()
		};

		const createProjectQuery = `INSERT INTO projects(name, wid, cid, active, is_private, template, template_id,
                                                     billable, auto_estimates, estimated_hours, at, color, rate)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;
		const projectValues = [
			projectData.name,
			projectData.wid,
			projectData.cid,
			projectData.active,
			projectData.is_private,
			projectData.template,
			projectData.template_id,
			projectData.billable,
			projectData.auto_estimates,
			projectData.estimated_hours,
			projectData.at,
			projectData.color,
			projectData.rate
		];
		await pool.query(createProjectQuery, projectValues);

		const userData = {
			api_token: faker.random.word(20, 20),
			default_wid: faker.random.number(100),
			email: faker.internet.email(),
			fullname: faker.internet.userName(),
			password: faker.internet.password(),
			jquery_timeofday_format: "h:i A",
			jquery_date_format: "d.m.Y",
			timeofday_format: "h:mm A",
			date_format: "DD.MM.YYYY",
			store_start_and_stop_time: faker.random.boolean(),
			beginning_of_week: faker.random.number(6),
			language: faker.random.locale(),
			image_url: faker.image.imageUrl(),
			sidebar_piechart: faker.random.boolean(),
			at: faker.date.future(0.1),
			retention: faker.random.number(100),
			record_timeline: faker.random.boolean(),
			render_timeline: faker.random.boolean(),
			timeline_enabled: faker.random.boolean(),
			timeline_experiment: faker.random.boolean()
		};
		const createUserQuery = `INSERT INTO users(api_token, default_wid, email, fullname, password,
                                               jquery_timeofday_format, jquery_date_format, timeofday_format,
                                               date_format, store_start_and_stop_time, beginning_of_week, language,
                                               image_url, sidebar_piechart, at, retention, record_timeline,
                                               render_timeline, timeline_enabled, timeline_experiment)
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                                         $18, $19, $20) RETURNING *`;
		const userValues = [
			userData.api_token,
			userData.default_wid,
			userData.email,
			userData.fullname,
			userData.password,
			userData.jquery_timeofday_format,
			userData.jquery_date_format,
			userData.timeofday_format,
			userData.date_format,
			userData.store_start_and_stop_time,
			userData.beginning_of_week,
			userData.language,
			userData.image_url,
			userData.sidebar_piechart,
			userData.at,
			userData.retention,
			userData.record_timeline,
			userData.render_timeline,
			userData.timeline_enabled,
			userData.timeline_experiment
		];
		await pool.query(createUserQuery, userValues);
	}

	for (let i = 0; i < 10; i++) {
		const projectUsersData = {
			pid: faker.random.number({ min: 1, max: 10 }),
			uid: faker.random.number({ min: 1, max: 10 }),
			wid: faker.random.number({ min: 1, max: 10 }),
			manager: faker.random.boolean(),
			rate: faker.random.float(),
			at: faker.date.future(0.1)
		};
		const createProjectUsersQuery = `INSERT INTO project_users(pid, uid, wid, manager, rate, at)
                                         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
		const projectUsersValues = [
			projectUsersData.pid,
			projectUsersData.uid,
			projectUsersData.wid,
			projectUsersData.manager,
			projectUsersData.rate,
			projectUsersData.at
		];
		await pool.query(createProjectUsersQuery, projectUsersValues);
	}

	await pool.end();
})();
