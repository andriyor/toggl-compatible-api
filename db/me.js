const { pool } = require("./db");

class Users {
	static async getByName(name) {
		const query = "SELECT * FROM users WHERE fullname = $1";
		const { rows } = await pool.query(query, [name]);
		return rows[0];
	}

	static async getDefaultWorkspaceByUserName(name) {
		const query = "SELECT default_wid FROM users WHERE fullname = $1";
		const { rows } = await pool.query(query, [name]);
		return rows[0].default_wid;
	}


}

module.exports = {
	Users
};
