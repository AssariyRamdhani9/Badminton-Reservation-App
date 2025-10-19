const pool = require('../config/db');

const getCourts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courts ORDER BY court_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCourt = async (req, res) => {
  try {
    const { name, location } = req.body;
    const result = await pool.query(
      "INSERT INTO courts (name, location) VALUES ($1, $2) RETURNING *",
      [name, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCourts, createCourt };
