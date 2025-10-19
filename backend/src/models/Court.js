const db = require('../config/db');

const Court = {
  async getAll() {
    const result = await pool.query("SELECT * FROM courts ORDER BY id ASC");
    return result.rows;
  },


  async create({ name, location }) {
    const result = await pool.query(
      "INSERT INTO courts (name, location) VALUES ($1, $2) RETURNING *",
      [name, location]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM courts WHERE id = $1", [id]);
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query("DELETE FROM courts WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
  },
};

module.exports = Court;
