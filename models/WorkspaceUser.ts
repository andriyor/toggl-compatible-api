import {NameEntity} from "./NameEntity";

export interface WorkspaceUser extends NameEntity{
	uid: number;
	wid: number;
	admin: boolean;
	active: boolean;
	email: string;
	at: Date;
	invite_url: string;
}

export interface WorkspaceUsersBody {
	workspace_user: WorkspaceUser;
}

export interface WorkspaceUserParams {
	workspace_user_id: string;
}
