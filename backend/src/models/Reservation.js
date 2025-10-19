const pool = require('../config/db');

const Reservation = {
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS reservations (
        reservation_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id), -- Sesuaikan dengan users.user_id
        court_id INTEGER NOT NULL REFERENCES courts(court_id), -- Asumsi courts menggunakan court_id
        reservation_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        order_id VARCHAR(50),
        payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (court_id, reservation_date, start_time, end_time)
      );
    `;
    await pool.query(query);
  },

  async create({ user_id, court_id, reservation_date, start_time, end_time, total_price, payment_status }) {
    const query = `
      INSERT INTO reservations (user_id, court_id, reservation_date, start_time, end_time, total_price, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [user_id, court_id, reservation_date, start_time, end_time, total_price, payment_status];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM reservations ORDER BY reservation_date DESC');
    return rows;
  },

  async updatePaymentStatus(reservation_id, status) {
  const query = `
    UPDATE reservations
    SET payment_status = $1
    WHERE order_id = $2
    RETURNING *;
  `;
  const values = [status, reservation_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
},
};

module.exports = Reservation;