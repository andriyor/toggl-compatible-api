import pool from './db';

export class Users {
	static async findByUsername(username: string) {
		const query = "SELECT * FROM users WHERE fullname = $1";
		const { rows } = await pool.query(query, [username]);
		return rows;
	}
}
