const express = require('express');
const router = express.Router();
const { getCourts, createCourt } = require('../controllers/courtController');

router.get('/', getCourts);
router.post('/', createCourt);

module.exports = router;
