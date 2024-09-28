const OnePay = require("../../middleware/onepay");
const qr = require('qr-image');

const mcid = "mch5c2f0404102fb";
//const shopcode = "12345678";
//const uuid = "order-12345";
const onePay = new OnePay(mcid);

exports.initiatePayment = (req, res) => {
    const { transactionid, invoiceid, terminalid, amount, description } = req.body
    try {
        const paymentData = {
            transactionid: transactionid + "",
            invoiceid: invoiceid + "",
            terminalid: terminalid + "",
            amount: amount + "",
            description: description + ""
        }

        onePay.getCode(
            paymentData,
            function (qrCode) {
                // Send the generated QR code as a response
                //res.json({ qrCode });
                const qrCodeData = qrCode; // Accept the QR code data from query parameters

                if (!qrCodeData) {
                    return res.status(400).json({ error: 'QR code data is required' });
                }

                // Generate QR code image
                const qrImage = qr.image(qrCodeData, { type: 'png' });

                // Set the content type to image/png
                res.type('png');
                qrImage.pipe(res); // Send the generated image as a response
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Payment initiation failed." });
    }
};

exports.generateQrCode = async (req, res) => {
    try {
        const { amount, description } = req.body;

        if (!amount || !description) {
            return res.status(400).json({ message: "Amount and description are required." });
        }

        const mcid = "mch5c2f0404102fb"; // Merchant ID
        const shopcode = "12345678"; // Shop code
        const terminalid = "001"; // Terminal ID

        // Generate unique order code
        const dt = new Date();
        const ordercode = dt.getFullYear().toString().padStart(4, '0') + '' +
            (dt.getMonth() + 1).toString().padStart(2, '0') + '' +
            dt.getDate().toString().padStart(2, '0') + '' +
            dt.getHours().toString().padStart(2, '0') + '' +
            dt.getMinutes().toString().padStart(2, '0') + '' +
            dt.getSeconds().toString().padStart(2, '0');
        const uuid = ordercode;
        const invoiceid = ordercode;

        const onePay = new OnePay(mcid, shopcode); // Create new OnePay instance
        onePay.debug = true; // Enable OnePay debug

        const paymentData = {
            transactionid: uuid, // Unique key
            invoiceid: invoiceid, // Invoice ID
            terminalid: terminalid, // Terminal ID
            amount: amount, // Invoice amount
            description: description, // Description in English
            expiretime: 60, // Expire time in minutes
        }

        onePay.getCode(paymentData, function (code) {
            if (code) {
                const qrCodeUrl = `https://qrcode.tec-it.com/API/QRCode?data=${code}&backcolor=%23ffffff&size=small&quietzone=1&errorcorrection=H`;
                return res.status(200).json({
                    qrCodeUrl: qrCodeUrl,
                    code: code,
                    message: "QR code generated successfully.",
                    status: true,
                    onepayLink: `onepay://qr/${code}`,
                    data: paymentData
                });
            } else {
                return res.status(500).json({ message: "Failed to generate QR code." });
            }
        });
    } catch (error) {
        console.error("Error generating QR code:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

exports.subScription = async (req, res) => {
    try {
        const { uuid, tid, shopcode } = req.body;

        if (!uuid) {
            return res.status(400).json({ message: "UUID is required." });
        }

        const params = {
            uuid: uuid,       // Unique identifier for the transaction
            tid: tid || null, // Terminal ID (optional)
            shopcode: shopcode || '12345678' // Shop code (optional)
        };

        onePay.subscribe(params, function (paymentResult) {
            // Handle the payment result here
            console.log("Payment completed:", paymentResult);

            // Send the result back to the client
            return res.status(200).json({
                message: "Payment completed successfully.",
                paymentResult: paymentResult
            });
        });

        res.status(200).json({ message: "Subscription started successfully." });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: err.message
        });
    }
};