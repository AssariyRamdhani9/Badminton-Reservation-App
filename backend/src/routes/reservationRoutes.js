const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.post('/', reservationController.createReservation);

router.get('/', reservationController.getReservations);

router.get('/user/:user_id', reservationController.getUserReservations);

module.exports = router;