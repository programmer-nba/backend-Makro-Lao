const mongoose = require("mongoose")
const { Schema } = mongoose

const codSchema = new Schema(
    {
        percent: { type: Number, required: true, min: 0, max: 10 },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("COD", codSchema);