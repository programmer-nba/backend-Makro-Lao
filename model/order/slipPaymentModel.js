const mongoose = require('mongoose');
const { Schema } = mongoose;

const slipPaymentSchema = new Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    slipImageUrl: {
        type: String,
        required: true,
        default:""
    }
}, {
    timestamps: true
});

const SlipPayment = mongoose.model("SlipPayment", slipPaymentSchema)

module.exports = { SlipPayment }