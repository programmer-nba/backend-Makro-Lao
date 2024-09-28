const jwt = require("jsonwebtoken");
const { User } = require("../model/user/userModel");
require("dotenv").config({ path: __dirname + '../../.env' });

exports.auth = async (req, res, next) => {
    try {
        const token = req.header("token");
        if (!token) {
            return res.status(401).send({ message: "กรุณาแนบ token มากับ header" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).send({ message: "Token หมดอายุแล้ว" });
            }
            return res.status(401).send({ message: "Token ไม่ถูกต้อง" });
        }

        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).send({ message: "ไม่พบผู้ใช้งานนี้ในระบบ" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด โปรดลองอีกครั้ง" });
    }
};