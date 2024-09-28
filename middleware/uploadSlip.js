const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadFolder = path.join(__dirname, './uploads/slips');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        const order_id = req.body.order_id;
        const extension = path.extname(file.originalname);
        const filename = `slip_order_${order_id}${extension}`;
        cb(null, filename);
        console.log(order_id);
        console.log(`File saved as: ${filename}`);
    },
});

module.exports = { storage };
