const express = require('express');
const router = express.Router();
const midtransController = require('../controllers/MidtransController'); 

router.post('/midtrans/notification', midtransController.handleNotification); 

module.exports = router;