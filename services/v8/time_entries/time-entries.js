const auth = require("basic-auth");
const { TimeEntries } = require("../../../db/timeEntries");
const { Users } = require("../../../db/me");

const responseTimeEntries = {
	id: {
		type: "integer"
	},
	wid: {
		type: "integer"
	},
	pid: {
		type: "integer"
	},
	tid: {
		type: "integer"
	},
	uid: {
		type: "integer"
	},
	billable: {
		type: "boolean"
	},
	duronly: {
		type: "boolean"
	},
	start: {
		type: "string",
		format: "date-time"
	},
	stop: {
		type: "string",
		format: "date-time"
	},
	duration: {
		type: "integer"
	},
	description: {
		type: "string"
	},
	at: {
		type: "string",
		format: "date-time"
	},
	tags: {
		type: "array",
		items: {
			type: "string"
		}
	}
};

const { id, at, ...timeEntriesPost } = responseTimeEntries;
timeEntriesPost.created_with = { type: "string" };
const {stop, ...responseStartStop} = responseTimeEntries;
const { duration, start, ...timeEntriesStartBody } = responseStartStop;
const successfulResponse = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: responseTimeEntries,
				required: ["id", "duration", "start"]
			}
		}
	}
};
const successfulResponseStartStop = {
	200: {
		type: "object",
		properties: {
			data: {
				type: "object",
				properties: timeEntriesStartBody,
				required: ["id", "duration", "start"]
			}
		}
	}
};

module.exports = async fastify => {
	const timeEntryIdParam = {
		type: "object",
		properties: {
			time_entry_id: {
				type: "string",
				description: "time entry id"
			}
		}
	};

	const timeEntryByIDSchema = {
		schema: {
			tags: ["time-entries"],
			summary: "Get time entry details",
			params: timeEntryIdParam,
			response: successfulResponse
		}
	};
	fastify.get("/:time_entry_id", timeEntryByIDSchema, async request => {
		const timeEntry = await TimeEntries.getById(request.params.time_entry_id);
		return { data: timeEntry };
	});

	const timeEntriesPostPutSchema = {
		schema: {
			tags: ["time-entries"],
			summary: "Create a time entry",
			body: {
				type: "object",
				properties: {
					time_entry: {
						type: "object",
						properties: timeEntriesPost,
						required: ["duration", "start", "created_with"]
					}
				}
			},
			response: successfulResponseStartStop
		}
	};
	fastify.post("/", timeEntriesPostPutSchema, async request => {
		const currentUser = auth.parse(request.headers.authorization);
		const user = await Users.getByName(currentUser.name);
		const timeEntry = await TimeEntries.create(request.body.time_entry, user);
		return { data: timeEntry };
	});

	const timeEntriesStartSchema = {
		schema: {
			tags: ["time-entries"],
			summary: "Start a time entry",
			description: "Already running time entry must stop",
			body: {
				type: "object",
				properties: {
					time_entry: {
						type: "object",
						properties: timeEntriesStartBody,
						required: ["created_with"]
					}
				}
			},
			response: successfulResponseStartStop
		}
	};
	fastify.post("/start", timeEntriesStartSchema, async request => {
		const runningTimeEntries = await TimeEntries.getRunningTimeEntries();
		if (runningTimeEntries.length) {
			await TimeEntries.stopTimeEntry(runningTimeEntries[0].duration, runningTimeEntries[0].id);
		}
		const currentUser = auth.parse(request.headers.authorization);
		const user = await Users.getByName(currentUser.name);
		const timeEntry = await TimeEntries.create(request.body.time_entry, user);
		return { data: timeEntry };
	});

	const timeEntryStopSchema = {
		schema: {
			tags: ["time-entries"],
			summary: "Stop a time entry",
			params: timeEntryIdParam,
			response: successfulResponse
		}
	};
	fastify.put("/:time_entry_id/stop", timeEntryStopSchema, async request => {
		const timeEntry = await TimeEntries.getById(request.params.time_entry_id);
		if (timeEntry.stop) {
			return "Time entry already stopped";
		}
		const result = await TimeEntries.stopTimeEntry(
			timeEntry.duration,
			request.params.time_entry_id
		);
		return { data: result.rows[0] };
	});

	const timeEntryCurrentSchema = {
		schema: {
			tags: ["time-entries"],
			summary: "Get running time entry",
			response: successfulResponse
		}
	};
	fastify.get("/current", timeEntryCurrentSchema, async () => {
		const runningTimeEntries = await TimeEntries.getRunningTimeEntries();
		return { data: runningTimeEntries[0] };
	});

	const updateTimeEntrySchema = {
		schema: {
			tags: ["time-entries"],
			params: timeEntryIdParam,
			body: {
				type: "object",
				properties: {
					time_entry: {
						type: "object",
						properties: timeEntriesPost
					}
				}
			},
			response: successfulResponse,
			summary: "Update a time entry"
		}
	};
	fastify.put("/:time_entry_id", updateTimeEntrySchema, async request => {
		const timeEntry = await TimeEntries.updateOne(
			request.params.time_entry_id,
			request.body.time_entry
		);
		return { data: timeEntry };
	});

	const timeEntryDeleteSchema = {
		schema: {
			tags: ["time-entries"],
			summary: "Delete a time entry",
			params: timeEntryIdParam
		}
	};
	fastify.delete("/:time_entry_id", timeEntryDeleteSchema, async request => {
		await TimeEntries.destroy(request.params.time_entry_id);
		return "OK";
	});

	const timeEntriesRangeSchema = {
		schema: {
			tags: ["time-entries"],
			summary: "Get time entries started in a specific time range",
			description:
				"With start_date and end_date parameters you can specify the date range of the time " +
				"entries returned. If start_date and end_date are not specified, time entries started during the " +
				"last 9 days are returned. The limit of returned time entries is 1000. So only the first 1000 " +
				"found time entries are returned. To get all time entries for a specific time span, you should " +
				"consider using the detailed report request, which returns paginated results, but enables you" +
				" to get all the asked time entries with multiple requests.\n" +
				"\n" +
				"start_date and end_date must be ISO 8601 date and time strings.",
			querystring: {
				start_date: { type: "string" },
				end_date: { type: "string" }
			},
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: responseTimeEntries
					}
				}
			}
		}
	};
	fastify.get("/", timeEntriesRangeSchema, async request => {
		return await TimeEntries.getTimeEntriesByTimeRange(
			request.query.start_date,
			request.query.end_date
		);
	});
};
