const responseUser = {
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

module.exports = {
	responseUser
};
