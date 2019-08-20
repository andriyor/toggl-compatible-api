import { NameEntity } from "./NameEntity";

export interface Client extends NameEntity {
	wid: number;
	notes?: string;
	at: Date;
}

export interface ClientBody {
	client: Client;
}

export interface ClientParams {
	client_id: string;
}
