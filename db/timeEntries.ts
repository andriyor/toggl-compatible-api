import pool from "./db";

import { TimeEntry } from "../models/TimeEntry";
import { User } from "../models/User";

export class TimeEntries {
	static async getRunningTimeEntries(): Promise<TimeEntry[]> {
		const runningTimeEntryQuery = "SELECT * FROM time_entries WHERE stop IS NULL";
		const { rows } = await pool.query(runningTimeEntryQuery);
		return rows;
	}

	static async stopTimeEntry(duration: number, timeEntryId: string) {
		const nowDate = new Date();
		// @ts-ignore
		const newDuration = Math.floor(nowDate / 1000) + duration;

		const updateOneQuery = `UPDATE time_entries
                            SET duration=$1,
                                stop=$2
                            WHERE id = $3 returning *`;
		return await pool.query(updateOneQuery, [newDuration, nowDate, timeEntryId]);
	}

	static getValues(time_entry: TimeEntry, oldTimeEntry: TimeEntry) {
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

	static async create(timeEntry: TimeEntry, user: User): Promise<TimeEntry> {
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
			// @ts-ignore
			timeEntry.duration || -Math.floor(nowDate / 1000)
		];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async getById(timeEntryId: string): Promise<TimeEntry> {
		const query = "SELECT * FROM time_entries WHERE id = $1";
		const { rows } = await pool.query(query, [timeEntryId]);
		return rows[0];
	}

	static async updateOne(timeEntryId: string, timeEntry: TimeEntry): Promise<TimeEntry> {
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

	static async getTimeEntriesByTimeRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
		const query = "SELECT * FROM time_entries WHERE stop BETWEEN $1 AND $2";
		const { rows } = await pool.query(query, [startDate, endDate]);
		return rows;
	}

	static async destroy(timeEntryId: string) {
		const query = "DELETE FROM time_entries WHERE id = $1;";
		await pool.query(query, [timeEntryId]);
	}

	static async unsetProject(projectId: string) {
		const query = "UPDATE time_entries SET pid=NULL WHERE pid = $1;";
		await pool.query(query, [projectId]);
	}

	static async unsetTask(taskId: string) {
		const query = "UPDATE time_entries SET tid=NULL WHERE tid = $1;";
		await pool.query(query, [taskId]);
	}
}
