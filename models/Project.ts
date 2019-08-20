import { NameEntity } from "./NameEntity";

export interface Project extends NameEntity {
	wid: number;
	cid: number;
	billable: boolean;
	is_private: boolean;
	active: boolean;
	at: Date;
	template_id: number;
	color: string;
	template: boolean;
	auto_estimates: boolean;
	estimated_hours: number;
	rate: number
}

export interface ProjectBody {
	project: Project;
}

export interface ProjectParams {
	project_id: string;
}
