const mongoose = require("mongoose")
const { Schema } = mongoose

// user
const userSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        code: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, default: "" },
        phone: { type: String, required: true },
        status: { type: String, required: true, default: "active" },
        user_count: { type: Number, required: true },
        region: { type: String, default: "lao" },
        role: { type: String, default: "user" },
    },
    {
        timestamps: true
    }
)
const User = mongoose.model("User", userSchema)

// user log
const userLogSchema = new Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        activity: { type: String, required: true },
    },
    {
        timestamps: true
    }
)
const UserLog = mongoose.model("UserLog", userLogSchema)

module.exports = { User, UserLog }