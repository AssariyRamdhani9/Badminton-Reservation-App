const midtransClient = require('midtrans-client');

const isProduction = false; 
const SERVER_KEY =  process.env.MIDTRANS_SERVER_KEY; 


const snap = new midtransClient.Snap({
    isProduction: isProduction,
    serverKey: SERVER_KEY,
});

module.exports = snap;