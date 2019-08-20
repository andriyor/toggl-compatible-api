const faker = require("faker");
import crypto from "crypto";
import pool from "./db";

const usersTable = `CREATE TABLE IF NOT EXISTS
                        users
                    (
                        id                        SERIAL PRIMARY KEY,
                        api_token                 VARCHAR(128) UNIQUE,
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
                        send_product_emails       BOOLEAN,
                        send_weekly_report        BOOLEAN,
                        send_timer_notifications  BOOLEAN,
                        openid_enabled            BOOLEAN,
                        timezone                  VARCHAR(128),

                        retention                 INT,
                        record_timeline           BOOLEAN,
                        render_timeline           BOOLEAN,
                        timeline_enabled          BOOLEAN,
                        timeline_experiment       BOOLEAN
                    )`;

const workspacesTable = `CREATE TABLE IF NOT EXISTS
                             workspaces
                         (
                             id                              SERIAL PRIMARY KEY,
                             name                            VARCHAR(128) UNIQUE,
                             premium                         BOOLEAN,
                             default_hourly_rate             FLOAT,
                             default_currency                VARCHAR(128),
                             only_admins_may_create_projects BOOLEAN,
                             only_admins_see_billable_rates  BOOLEAN,
                             rounding                        INT,
                             rounding_minutes                INT,
                             at                              TIMESTAMP,
                             logo_url                        VARCHAR(512)
                         )`;

const clientsTable = `CREATE TABLE IF NOT EXISTS
                          clients
                      (
                          id    SERIAL PRIMARY KEY,
                          name  VARCHAR(128) NOT NULL,
                          wid   INT          NOT NULL,
                          FOREIGN KEY (wid) REFERENCES workspaces (id),
                          notes VARCHAR(512),
                          at    TIMESTAMP
                      )`;

const projectsTable = `CREATE TABLE IF NOT EXISTS
                           projects
                       (
                           id              SERIAL PRIMARY KEY,
                           name            VARCHAR(128) UNIQUE,
                           wid             INT,
                           FOREIGN KEY (wid) REFERENCES workspaces (id),
                           cid             INT,
                           FOREIGN KEY (cid) REFERENCES clients (id),
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

const projectUsersTable = `CREATE TABLE IF NOT EXISTS
                               project_users
                           (
                               id      SERIAL PRIMARY KEY,
                               pid     INT NOT NULL,
                               FOREIGN KEY (pid) REFERENCES projects (id),
                               uid     INT NOT NULL,
                               FOREIGN KEY (uid) REFERENCES users (id),
                               wid     INT,
                               FOREIGN KEY (wid) REFERENCES workspaces (id),
                               manager BOOLEAN,
                               rate    FLOAT,
                               at      TIMESTAMP
                           )`;

const tagsTable = `CREATE TABLE IF NOT EXISTS
                       tags
                   (
                       id   SERIAL PRIMARY KEY,
                       name VARCHAR(128) UNIQUE,
                       wid  INT NOT NULL,
                       FOREIGN KEY (wid) REFERENCES workspaces (id),
                       unique (name, wid)
                   )`;

const workspaceUsersTable = `CREATE TABLE IF NOT EXISTS
                                 workspace_users
                             (
                                 id         SERIAL PRIMARY KEY,
                                 uid        INT NOT NULL,
                                 wid        INT NOT NULL,
                                 FOREIGN KEY (uid) REFERENCES users (id),
                                 FOREIGN KEY (wid) REFERENCES workspaces (id),
                                 admin      BOOLEAN,
                                 active     BOOLEAN,
                                 invite_url VARCHAR(512)
                             )`;

const groupsTable = `CREATE TABLE IF NOT EXISTS
                         groups
                     (
                         id   SERIAL PRIMARY KEY,
                         name VARCHAR(128) NOT NULL,
                         wid  INT          NOT NULL,
                         FOREIGN KEY (wid) REFERENCES workspaces (id),
                         at   TIMESTAMP,
                         unique (name, wid)
                     )`;

const tasksTable = `CREATE TABLE IF NOT EXISTS
                        tasks
                    (
                        id                SERIAL PRIMARY KEY,
                        name              VARCHAR(128) NOT NULL UNIQUE,
                        pid               INT          NOT NULL,
                        FOREIGN KEY (pid) REFERENCES projects (id),
                        wid               INT          NOT NULL,
                        FOREIGN KEY (wid) REFERENCES workspaces (id),
                        uid               INT          NOT NULL,
                        FOREIGN KEY (uid) REFERENCES users (id),
                        estimated_seconds INT,
                        active            BOOLEAN,
                        at                TIMESTAMP,
                        tracked_seconds   INT
                    )`;

const timeEntriesTable = `CREATE TABLE IF NOT EXISTS
                              time_entries
                          (
                              id           SERIAL PRIMARY KEY,
                              pid          INT,
                              FOREIGN KEY (pid) REFERENCES projects (id),
                              wid          INT,
                              FOREIGN KEY (wid) REFERENCES workspaces (id),
                              tid          INT,
                              FOREIGN KEY (tid) REFERENCES tasks (id),
                              uid          INT,
                              FOREIGN KEY (uid) REFERENCES users (id),
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

(async () => {
	await pool.query(usersTable);
	await pool.query(workspacesTable);
	await pool.query(clientsTable);
	await pool.query(projectsTable);
	await pool.query(projectUsersTable);
	await pool.query(tagsTable);
	await pool.query(workspaceUsersTable);
	await pool.query(groupsTable);
	await pool.query(tasksTable);
	await pool.query(timeEntriesTable);

	for (let i = 0; i < 10; i++) {
		const userData = {
			api_token: crypto.randomBytes(16).toString("hex"),
			default_wid: faker.random.number({ min: 1, max: 10 }),
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
			send_product_emails: faker.random.boolean(),
			send_weekly_report: faker.random.boolean(),
			send_timer_notifications: faker.random.boolean(),
			openid_enabled: faker.random.boolean(),
			timezone: faker.random.word(),
			retention: faker.random.number(100),
			record_timeline: faker.random.boolean(),
			render_timeline: faker.random.boolean(),
			timeline_enabled: faker.random.boolean(),
			timeline_experiment: faker.random.boolean()
		};
		const createUserQuery = `INSERT INTO users(api_token, default_wid, email, fullname, password,
                                               jquery_timeofday_format, jquery_date_format, timeofday_format,
                                               date_format, store_start_and_stop_time, beginning_of_week, language,
                                               image_url, sidebar_piechart, at, send_product_emails,
                                               send_weekly_report, send_timer_notifications, openid_enabled,
                                               timezone, retention, record_timeline, render_timeline, timeline_enabled,
                                               timeline_experiment)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                                     $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *`;
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
			userData.send_product_emails,
			userData.send_weekly_report,
			userData.send_timer_notifications,
			userData.openid_enabled,
			userData.timezone,
			userData.retention,
			userData.record_timeline,
			userData.render_timeline,
			userData.timeline_enabled,
			userData.timeline_experiment
		];
		await pool.query(createUserQuery, userValues);

		const workspacesData = {
			name: faker.random.word(),
			premium: faker.random.boolean(),
			default_hourly_rate: faker.random.float(),
			default_currency: faker.finance.currencyCode(),
			only_admins_may_create_projects: faker.random.boolean(),
			only_admins_see_billable_rates: faker.random.boolean(),
			rounding: faker.random.number({ min: -1, max: 1 }),
			rounding_minutes: faker.random.number({ min: 1, max: 60 }),
			at: faker.date.future(0.1),
			logo_url: faker.image.imageUrl()
		};
		const createWorkspacesQuery = `INSERT INTO workspaces(name, premium, default_hourly_rate, default_currency,
                                                          only_admins_may_create_projects,
                                                          only_admins_see_billable_rates,
                                                          rounding, rounding_minutes,
                                                          at, logo_url)
                                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
		const workspacesValues = [
			workspacesData.name,
			workspacesData.premium,
			workspacesData.default_hourly_rate,
			workspacesData.default_currency,
			workspacesData.only_admins_may_create_projects,
			workspacesData.only_admins_see_billable_rates,
			workspacesData.rounding,
			workspacesData.rounding_minutes,
			workspacesData.at,
			workspacesData.logo_url
		];
		await pool.query(createWorkspacesQuery, workspacesValues);
	}

	for (let i = 0; i < 10; i++) {
		const workspaceUsersData = {
			uid: faker.random.number({ min: 1, max: 10 }),
			wid: faker.random.number({ min: 1, max: 10 }),
			admin: faker.random.boolean(),
			active: faker.random.boolean(),
			invite_url: faker.internet.url()
		};
		const createWorkspaceUsersQuery = `INSERT INTO workspace_users(uid, wid, admin, active, invite_url)
                                       VALUES ($1, $2, $3, $4, $5) RETURNING *`;
		const workspaceUsersTableValues = [
			workspaceUsersData.uid,
			workspaceUsersData.wid,
			workspaceUsersData.admin,
			workspaceUsersData.active,
			workspaceUsersData.invite_url
		];
		await pool.query(createWorkspaceUsersQuery, workspaceUsersTableValues);
	}

	for (let i = 0; i < 10; i++) {
		const clientsData = {
			name: faker.random.word(),
			wid: faker.random.number({ min: 1, max: 10 }),
			notes: faker.random.words(),
			at: faker.date.future(0.1)
		};
		const createClientQuery = `INSERT INTO clients(name, wid, notes, at)
                               VALUES ($1, $2, $3, $4) RETURNING *`;
		const clientTableValues = [
			clientsData.name,
			clientsData.wid,
			clientsData.notes,
			clientsData.at
		];
		await pool.query(createClientQuery, clientTableValues);
	}

	for (let i = 0; i < 10; i++) {
		const projectData = {
			name: faker.random.words(),
			wid: faker.random.number({ min: 1, max: 10 }),
			cid: faker.random.number({ min: 1, max: 10 }),
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

	for (let i = 0; i < 10; i++) {
		const groupData = {
			name: faker.random.word(),
			wid: faker.random.number({ min: 1, max: 10 }),
			at: faker.date.future(0.1)
		};
		const createGroupQuery = `INSERT INTO groups(name, wid, at)
                              VALUES ($1, $2, $3) RETURNING *`;
		const groupValues = [groupData.name, groupData.wid, groupData.at];
		await pool.query(createGroupQuery, groupValues);
	}

	for (let i = 0; i < 10; i++) {
		const taskData = {
			name: faker.random.word(),
			pid: faker.random.number({ min: 1, max: 10 }),
			wid: faker.random.number({ min: 1, max: 10 }),
			uid: faker.random.number({ min: 1, max: 10 }),
			estimated_seconds: faker.random.number(),
			active: faker.random.boolean(),
			at: faker.date.future(0.1),
			tracked_seconds: faker.random.number()
		};
		const createTaskQuery = `INSERT INTO tasks(name, pid, wid, uid, estimated_seconds, active, at, tracked_seconds)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
		const taskValues = [
			taskData.name,
			taskData.pid,
			taskData.wid,
			taskData.uid,
			taskData.estimated_seconds,
			taskData.active,
			taskData.at,
			taskData.tracked_seconds
		];
		await pool.query(createTaskQuery, taskValues);
	}

	for (let i = 0; i < 10; i++) {
		const tagsData = {
			name: faker.random.word(),
			wid: faker.random.number({ min: 1, max: 10 })
		};
		const createTagsQuery = `INSERT INTO tags(name, wid)
                             VALUES ($1, $2) RETURNING *`;
		const tagsValues = [tagsData.name, tagsData.wid];
		await pool.query(createTagsQuery, tagsValues);
	}

	for (let i = 0; i < 10; i++) {
		const timeEntryData = {
			pid: faker.random.number({ min: 1, max: 10 }),
			wid: faker.random.number({ min: 1, max: 10 }),
			tid: faker.random.number({ min: 1, max: 10 }),
			uid: faker.random.number({ min: 1, max: 10 }),
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

		const createTimeEntryQuery = `INSERT INTO time_entries(pid, wid, tid, uid, created_with, billable, duronly, start,
                                                           stop, at, duration, description, tags)
                                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;
		const timeEntryValues = [
			timeEntryData.pid,
			timeEntryData.wid,
			timeEntryData.tid,
			timeEntryData.uid,
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
	}

	await pool.end();
})();
