import {BaseEntity} from "./BaseEntity";

export interface ProjectUser extends BaseEntity{
	pid: number;
	uid: number;
	wid: number;
	manager: boolean;
	rate: number;
	at: string;
	fields: string;
	fullname?: string
}

export interface ProjectUsersBody {
	project_user: ProjectUser;
}

export interface ProjectUsersParams {
	project_user_id: string;
}
