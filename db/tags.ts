import pool from './db';

class Tags {
	static async create(tag: any) {
		const query = `INSERT INTO tags(name, wid)
                   VALUES ($1, $2) RETURNING *`;
		const projectUserValues = [tag.name, tag.wid];
		const { rows } = await pool.query(query, projectUserValues);
		return rows[0];
	}

	static async updateOne(tagId: number, tag: any) {
		const query = `UPDATE tags
                   SET name=$1
                   WHERE id = $2 RETURNING *`;
		const values = [tag.name, tagId];
		const { rows } = await pool.query(query, values);
		return rows[0];
	}

	static async destroy(tagId: number) {
		const query = "DELETE FROM tags WHERE id = $1;";
		await pool.query(query, [tagId]);
	}
}

module.exports = {
	Tags
};
