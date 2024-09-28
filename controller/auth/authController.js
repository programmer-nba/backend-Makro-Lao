const { User } = require("../../model/user/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.login = async (req, res) => {
    const { username, password } = req.body
    try {
        if (!username || !password) {
            return res.status(400).json({ message: "username and password is required" })
        }

        const user = await User.findOne({ username: username }).select("-__v")
        if (!user) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งานนี้ในระบบ" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" })
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

        return res.status(200).json({ 
            message: "เข้าสู่ระบบสําเร็จ", 
            status: true,
            data: user,
            token: token 
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "มีบางอย่างผิดพลาด โปรดลองอีกครั้ง" })
    }
}