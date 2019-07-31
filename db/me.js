const { pool } = require("./db");

class Users {
	static async getByToken(token) {
		const query = "SELECT * FROM users WHERE api_token = $1";
		const { rows } = await pool.query(query, [token]);
		return rows[0];
	}
}

module.exports = {
	Users
};
