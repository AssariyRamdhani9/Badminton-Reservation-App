const path = require('path');
require('dotenv').config({ path: './config/.env'});

const express = require('express');
const { Pool } = require('pg'); 
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const courtRoutes = require('./routes/courtRoutes');
const midtransRoutes = require('./routes/midtransRoutes');

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});


pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error menghubungkan ke database:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error saat menjalankan query:', err.stack);
    }
    console.log('Koneksi database PostgreSQL berhasil:', result.rows[0].now);
  });
});


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server Backend DIRO App berjalan!');
});


app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api', midtransRoutes);


const port = process.env.PORT || 3001; 
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});