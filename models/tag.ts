import {BaseEntry} from "./base-entry";

export interface Tag extends BaseEntry {
	wid: number,
	name: string
}

export interface TagBody {
	tag: Tag
}

export interface TagParams {
	tag_id: number
}
