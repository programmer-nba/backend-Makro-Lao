const mongoose = require("mongoose")
const { Schema } = mongoose

const poSchema = new Schema(
    {
        code: { type: String, required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: Number, required: true, default: 1 },
        order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        
    },
    {
        timestamps: true
    }
)