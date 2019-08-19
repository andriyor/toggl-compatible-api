export const responseUser = {
	id: {
		type: "integer"
	},
	api_token: {
		type: "string"
	},
	default_wid: {
		type: "integer"
	},
	email: {
		type: "string"
	},
	fullname: {
		type: "string"
	},
	jquery_timeofday_format: {
		type: "string"
	},
	jquery_date_format: {
		type: "string"
	},
	timeofday_format: {
		type: "string"
	},
	date_format: {
		type: "string"
	},
	store_start_and_stop_time: {
		type: "boolean"
	},
	beginning_of_week: {
		type: "integer"
	},
	language: {
		type: "string"
	},
	image_url: {
		type: "string",
		format: "uri",
		"qt-uri-protocols": ["https"],
		"qt-uri-extensions": [".png"]
	},
	sidebar_piechart: {
		type: "boolean"
	},
	at: {
		type: "string",
		format: "date-time"
	},
	retention: {
		type: "integer"
	},
	record_timeline: {
		type: "boolean"
	},
	render_timeline: {
		type: "boolean"
	},
	timeline_enabled: {
		type: "boolean"
	},
	timeline_experiment: {
		type: "boolean"
	}
};

export const responseClient = {
	id: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	notes: {
		type: "string"
	},
	at: {
		type: "string",
		format: "date-time"
	}
};

export const responseGroup = {
	id: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	wid: {
		type: "integer"
	},
	at: {
		type: "string"
	}
};

export const responseProject = {
	id: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	cid: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	billable: {
		type: "boolean"
	},
	is_private: {
		type: "boolean"
	},
	active: {
		type: "boolean"
	},
	at: {
		type: "string",
		format: "date-time"
	},
	template_id: {
		type: "integer"
	},
	color: {
		type: "string"
	}
};

export const responseTask = {
	id: {
		type: "integer"
	},
	name: {
		type: "string"
	},
	wid: {
		type: "integer"
	},
	pid: {
		type: "integer"
	},
	uid: {
		type: "integer"
	},
	estimated_seconds: {
		type: "integer"
	},
	active: {
		type: "boolean"
	},
	at: {
		type: "string"
	},
	tracked_seconds: {
		type: "integer"
	}
};

export const responseTag = {
	id: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	name: {
		type: "string"
	}
};

export const responseProjectUsers = {
	id: {
		type: "integer"
	},
	pid: {
		type: "integer"
	},
	uid: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	manager: {
		type: "boolean"
	},
	rate: {
		type: "integer"
	}
};

export const responseWorkspaceUsers = {
	id: {
		type: "integer"
	},
	uid: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	admin: {
		type: "boolean"
	},
	active: {
		type: "boolean"
	},
	invite_url: {
		type: "string",
		format: "uri",
		"qt-uri-protocols": ["https"]
	}
};
