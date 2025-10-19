const db = require('../config/db');

class User {

  static async findByEmail(email) {
    const text = 'SELECT user_id AS id, name, email, password_hash FROM users WHERE email = $1';
    const values = [email];
    const { rows } = await db.query(text, values);
    console.log("DEBUG rows from findByEmail:", rows); 
    return rows[0];
  }


  static async create(name, email, passwordHash) {
    const text = `
      INSERT INTO users(name, email, password_hash)
      VALUES($1, $2, $3)
      RETURNING user_id AS id, name, email
    `;
    const values = [name, email, passwordHash];
    const { rows } = await db.query(text, values);
    return rows[0];
  }
}

module.exports = User;