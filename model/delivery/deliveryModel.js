const mongoose = require("mongoose")
const { Schema } = mongoose

const deliverySchema = new Schema(
    {
        name: { type: String, require: true }
    },
    {
        timestamps: true
    }
)
const Delivery = mongoose.model("Delivery", deliverySchema)

module.exports = { Delivery }