const mongoose = require("mongoose")
const { Schema } = mongoose

const orderSchema = new Schema(
    {
        code: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true 
        },
        user_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        status: { 
            type: Number,  
            default: 1 
        },
        line_items: [
            {
                product_id: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                ppu: { type: Number, required: true, min: 0 },
                currency: { type: String, default: "THB" },
                status: { type: Number, default: 1 }
            }
        ],
        items_price: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        cod_percent: { 
            type: Number, 
            required: true, 
            default: 3
        },
        cod_price: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        net_price: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        dropoff_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Dropoff", 
            required: true 
        },
        delivery_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Delivery", 
            required: true 
        },
        shipping: { 
            type: String, 
            default: "" 
        },
        paymentChannel: { 
            type: String, 
            default: "" 
        },
        deliveryBranch: { 
            type: String, 
            default: "" 
        },
        currency: { type: String, default: "THB" }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Order", orderSchema);