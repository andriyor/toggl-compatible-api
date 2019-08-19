import { NameEntity } from "./NameEntity";

export interface Task extends NameEntity {
	wid: number;
	pid: number;
	uid?: number;
	estimated_seconds?: number;
	active: boolean;
	at: Date;
	tracked_seconds: number;
}

export interface TaskBody {
	task: Task;
}

export interface TaskParams {
	task_id: string;
}
