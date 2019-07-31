const { pool } = require("./db");

class TimeEntries {
	static async getRunningTimeEntries() {
		const runningTimeEntryQuery = "SELECT * FROM time_entries WHERE stop IS NULL";
		const { rows } = await pool.query(runningTimeEntryQuery);
		return rows;
	}

	static async stopTimeEntry(duration, timeEntryId) {
		const nowDate = new Date();
		const newDuration = Math.floor(nowDate / 1000) + duration;

		const updateOneQuery = `UPDATE time_entries
                            SET duration=$1,
                                stop=$2
                            WHERE id = $3 returning *`;
		return await pool.query(updateOneQuery, [newDuration, nowDate, timeEntryId]);
	}

	static getValues(time_entry, oldTimeEntry) {
		return [
			time_entry.pid || oldTimeEntry.pid,
			time_entry.wid || oldTimeEntry.wid,
			time_entry.created_with || oldTimeEntry.created_with,
			time_entry.hasOwnProperty("billable") ? time_entry.billable : oldTimeEntry.billable,
			time_entry.hasOwnProperty("duronly") ? time_entry.duronly : oldTimeEntry.duronly,
			time_entry.start || oldTimeEntry.start,
			time_entry.stop || oldTimeEntry.stop,
			new Date(),
			time_entry.duration || oldTimeEntry.duration,
			time_entry.description || oldTimeEntry.description,
			time_entry.tags || oldTimeEntry.tags || {}
		];
	}

	static async create(timeEntry, user) {
		const query = `INSERT INTO time_entries(pid, wid, uid, created_with, billable, description, tags, start, at, duration)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
		const nowDate = new Date();

		const values = [
			timeEntry.pid,
			timeEntry.wid || user.default_wid,
			timeEntry.uid || user.id,
			timeEntry.created_with,
			timeEntry.billable,
			timeEntry.description,
			timeEntry.tags || {},
			nowDate,
			nowDate,
			timeEntry.duration || -Math.floor(nowDate / 1000)
		];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async getById(timeEntryId) {
		const query = "SELECT * FROM time_entries WHERE id = $1";
		const { rows } = await pool.query(query, [timeEntryId]);
		return rows[0];
	}

	static async updateOne(timeEntryId, timeEntry) {
		const findOneTimeEntryQuery = "SELECT * FROM time_entries WHERE id = $1";
		const result = await pool.query(findOneTimeEntryQuery, [timeEntryId]);
		const updateOneQuery = `UPDATE time_entries
                            SET pid=$1,
                                wid=$2,
                                created_with=$3,
                                billable=$4,
                                duronly=$5,
                                start=$6,
                                stop=$7,
                                at=$8,
                                duration=$9,
                                description=$10,
                                tags=$11
                            WHERE id = $12 returning *`;
		const values = TimeEntries.getValues(timeEntry, result.rows[0]);
		const { rows } = await pool.query(updateOneQuery, [...values, timeEntryId]);
		return rows[0];
	}

	static async getTimeEntriesByTimeRange(startDate, endDate) {
		const query = "SELECT * FROM time_entries WHERE stop BETWEEN $1 AND $2";
		const { rows } = await pool.query(query, [startDate, endDate]);
		return rows;
	}

	static async destroy(timeEntryId) {
		const query = "DELETE FROM time_entries WHERE id = $1;";
		await pool.query(query, [timeEntryId]);
	}

	static async unsetProject(projectId) {
		const query = "UPDATE time_entries SET pid=NULL WHERE pid = $1;";
		await pool.query(query, [projectId]);
	}

	static async unsetTask(taskId) {
		const query = "UPDATE time_entries SET tid=NULL WHERE tid = $1;";
		await pool.query(query, [taskId]);
	}
}

module.exports = {
	TimeEntries
};
