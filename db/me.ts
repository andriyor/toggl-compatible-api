import pool from "./db";
import { User } from "../models/User";

export class Users {
	static async getByToken(token: string): Promise<User> {
		const query = "SELECT * FROM users WHERE api_token = $1";
		const { rows } = await pool.query(query, [token]);
		return rows[0];
	}
}
