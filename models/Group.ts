import {NameEntity} from "./NameEntity";

export interface Group extends NameEntity{
	wid:  number;
	at:   Date;
}

export interface GroupBody {
	group: Group;
}

export interface GroupParams {
	group_id: string;
}
