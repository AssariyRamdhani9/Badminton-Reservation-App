const Reservation = require('../models/Reservation');
exports.handleNotification = async (req, res) => {
    const statusObject = req.body;
    

    const orderId = statusObject.order_id;
    const transactionStatus = statusObject.transaction_status;
    const fraudStatus = statusObject.fraud_status;


    let newPaymentStatus = 'PENDING';

    if (transactionStatus == 'capture') {
        if (fraudStatus == 'accept') {
            newPaymentStatus = 'PAID'; 
        }
    } else if (transactionStatus == 'settlement') {
        newPaymentStatus = 'PAID'; 
    } else if (transactionStatus == 'deny' || transactionStatus == 'cancel' || transactionStatus == 'expire') {
        newPaymentStatus = 'FAILED';
    }


    await Reservation.updatePaymentStatus(orderId, newPaymentStatus);


    res.status(200).send('OK');
};