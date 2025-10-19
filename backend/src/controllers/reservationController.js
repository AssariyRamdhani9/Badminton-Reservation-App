const Reservation = require('../models/Reservation');
const pool = require('../config/db');
const snap = require('../config/midtrans');

exports.createReservation = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); 

        const { user_id, court_id, reservation_date, start_time, end_time, total_price: clientTotalPrice } = req.body;

        if (!user_id || !court_id || !reservation_date || !start_time || !end_time) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Semua field wajib diisi.' });
        }


        const formattedDate = new Date(reservation_date).toISOString().split('T')[0];
        const start = new Date(`1970-01-01 ${start_time}`);
        const end = new Date(`1970-01-01 ${end_time}`);
        const durationMs = end - start;
        const durationHours = durationMs / (1000 * 60 * 60);

        if (durationHours <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Waktu selesai harus lebih besar dari waktu mulai.' });
        }


        const courtResult = await client.query('SELECT hourly_rate FROM courts WHERE court_id = $1', [court_id]);
        if (courtResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Court tidak ditemukan.' });
        }
        const hourlyRate = parseFloat(courtResult.rows[0].hourly_rate);
        const serverTotalPrice = Math.round(hourlyRate * durationHours);

        
        if (Math.abs(clientTotalPrice - serverTotalPrice) > 1) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Harga tidak sesuai: Client ${clientTotalPrice}, Server ${serverTotalPrice}` });
        }

        
        const reservation = await Reservation.create({
            user_id,
            court_id,
            reservation_date: formattedDate,
            start_time,
            end_time,
            total_price: serverTotalPrice,
            payment_status: 'PENDING',
        }, client);

        
        const orderId = `RSV-${reservation.reservation_id}-${Date.now()}`;

       
        const midtransPayload = {
            transaction_details: {
                order_id: orderId,
                gross_amount: serverTotalPrice,
            },
            credit_card: { secure: true },
            callbacks: {
                finish: 'http://localhost:3000/confirmation?status=success',
                error: 'http://localhost:3000/confirmation?status=error',
                pending: 'http://localhost:3000/confirmation?status=pending',
            }
        };

        const transaction = await snap.createTransaction(midtransPayload);
        const paymentUrl = transaction.redirect_url;

        
        await client.query(
            'UPDATE reservations SET order_id = $1 WHERE reservation_id = $2',
            [orderId, reservation.reservation_id]
        );

        await client.query('COMMIT'); 

        
        res.status(201).json({
            reservation_id: reservation.reservation_id,
            order_id: orderId,
            paymentUrl,
            message: 'Reservasi berhasil dibuat dan siap dibayar.',
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error membuat reservasi dan Midtrans:', error);
        res.status(500).json({ message: 'Gagal membuat reservasi dan transaksi Midtrans.' });
    } finally {
        client.release();
    }
};


exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findAll();
        res.json(reservations);
    } catch (error) {
        console.error('Error mengambil data reservasi:', error);
        res.status(500).json({ message: 'Gagal mengambil data reservasi.' });
    }
};


exports.getUserReservations = async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await pool.query(
            'SELECT * FROM reservations WHERE user_id = $1 ORDER BY reservation_date DESC',
            [user_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error mengambil reservasi user:', error);
        res.status(500).json({ message: 'Gagal mengambil reservasi user.' });
    }
};


exports.getReservations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations ORDER BY reservation_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error mengambil data reservasi:', error);
    res.status(500).json({ message: 'Gagal mengambil data reservasi.' });
  }
};
