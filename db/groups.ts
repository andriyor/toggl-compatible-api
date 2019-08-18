import pool from './db';

class Groups {
	static async create(group: any) {
		const query = `INSERT INTO groups(name, wid, at)
                   VALUES ($1, $2, $3) RETURNING *`;
		const values = [group.name, group.wid, new Date()];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async updateOne(groupId: number, group: any) {
		const query = `UPDATE groups
                   SET name=$1,
                       at=$2
                   WHERE id = $3 RETURNING *`;
		const values = [group.name, new Date(), groupId];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async destroy(groupId: number) {
		const query = "DELETE FROM groups WHERE id = $1;";
		await pool.query(query, [groupId]);
	}
}

module.exports = {
	Groups
};
