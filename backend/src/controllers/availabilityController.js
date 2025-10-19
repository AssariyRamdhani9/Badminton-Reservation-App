const pool = require('../config/db'); 
const Court = require('../models/Court');
const { generateAllTimeSlots } = require('../utils/timeUtils');


const SLOT_INTERVAL_MINUTES = 60;

exports.getAvailability = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Parameter tanggal (date) harus disediakan.' });
  }

  try {
    
    const courts = await Court.findAll();

    
    const reservationQuery = `
      SELECT court_id, start_time, end_time
      FROM reservations 
      WHERE reservation_date = $1 AND payment_status = 'CONFIRMED'
    `;
    const { rows: bookedSlots } = await pool.query(reservationQuery, [date]); 

    
    const allSlots = generateAllTimeSlots('08:00', '22:00', SLOT_INTERVAL_MINUTES);

    const availableSlots = [];

    
    for (const court of courts) {
      for (const slot of allSlots) {
        
        const conflict = bookedSlots.some(b => {
          if (b.court_id !== court.court_id) return false;

          
          return !(
            b.end_time <= slot.startTime ||
            b.start_time >= slot.endTime
          );
        });

        if (!conflict) {
          availableSlots.push({
            courtId: court.court_id,
            courtName: court.name,
            startTime: slot.startTime,
            endTime: slot.endTime,
            price: court.hourly_rate,
          });
        }
      }
    }

    
    res.json({
      date,
      interval: `${SLOT_INTERVAL_MINUTES} minutes`,
      availability: availableSlots,
    });

  } catch (error) {
    console.error('Error saat mengambil ketersediaan:', error);
    res.status(500).json({ message: 'Gagal mengambil data ketersediaan.' });
  }
};
