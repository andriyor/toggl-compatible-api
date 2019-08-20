import { BaseEntity } from "./BaseEntity";

export interface TimeEntry extends BaseEntity {
	wid: number;
	pid: number;
	tid: number;
	billable: boolean;
	start: Date;
	stop: Date;
	duration: number;
	description: string;
	tags: string[];
	at: Date;
	created_with: string;
	duronly: boolean;
	uid?: number
}

export interface TimeEntryBody {
	time_entry: TimeEntry;
}

export interface TimeEntryParams {
	time_entry_id: string;
}

export interface TimeEntryQuery {
	start_date: Date;
	end_date: Date
}
