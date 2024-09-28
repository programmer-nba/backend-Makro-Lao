const mongoose = require("mongoose")
const { Schema } = mongoose

const dropoffSchema = new Schema(
    {
        name: { type: String, require: true },
        branch: { type: String, default: "" },
        address1: { type: String, default: "" },
        address2: { type: String, default: "" },
        address3: { type: String, default: "" },
        country: { type: String, default: "" },
        province: { type: String, default: "" },
        district: { type: String, default: "" },
        subdistrict: { type: String, default: "" },
        zipcode: { type: String, default: "" },
    },
    {
        timestamps: true
    }
)
const Dropoff = mongoose.model("Dropoff", dropoffSchema)

module.exports = { Dropoff }