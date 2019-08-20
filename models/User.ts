import { BaseEntity } from "./BaseEntity";

export interface Welcome {
	since: number;
	data: User;
}

export interface User extends BaseEntity {
	api_token: string;
	default_wid: number;
	email: string;
	fullname: string;
	jquery_timeofday_format: string;
	jquery_date_format: string;
	timeofday_format: string;
	date_format: string;
	store_start_and_stop_time: boolean;
	beginning_of_week: number;
	language: string;
	image_url: string;
	sidebar_piechart: boolean;
	at: Date;
	retention: number;
	record_timeline: boolean;
	render_timeline: boolean;
	timeline_enabled: boolean;
	timeline_experiment: boolean;
	new_blog_post: Invitation;
	invitation: Invitation;
	password: string
}

export interface Invitation {}
