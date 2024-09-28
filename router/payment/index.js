const router = require("express").Router();
const Payment = require("../../controller/payment/paymentController");

router.post("/payment-qrcode", Payment.initiatePayment);
router.post("/payment/qrcode", Payment.generateQrCode);
router.post("/payment/subscription", Payment.subScription);

module.exports = router;
