import { NameEntity } from "./NameEntity";

export interface Workspace extends NameEntity {
	premium: boolean;
	admin: boolean;
	default_hourly_rate: number;
	default_currency: string;
	only_admins_may_create_projects: boolean;
	only_admins_see_billable_rates: boolean;
	rounding: number;
	rounding_minutes: number;
	at: Date;
	logo_url: string;
}

export interface WorkspaceBody {
	workspace: Workspace;
}

export interface WorkspaceParams {
	workspace_id: string;
}
