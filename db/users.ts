import pool from "./db";

import { User } from "../models/User";

export class Users {
	static async findByUsername(username: string): Promise<User[]> {
		const query = "SELECT * FROM users WHERE fullname = $1";
		const { rows } = await pool.query(query, [username]);
		return rows;
	}
}
