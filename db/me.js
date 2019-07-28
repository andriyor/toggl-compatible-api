const { pool } = require("./db");

class Users {
	static async getName(name) {
		const query = "SELECT * FROM users WHERE fullname = $1";
		const { rows } = await pool.query(query, [name]);
		return rows[0];
	}

}

module.exports = {
	Users
};
