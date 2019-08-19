import { NameEntity } from "./NameEntity";

export interface Tag extends NameEntity {
	wid: number;
}

export interface TagBody {
	tag: Tag;
}

export interface TagParams {
	tag_id: string;
}
