const { User } = require("../../model/user/userModel")
const bcrypt = require("bcrypt")

const generatePaddingCode = (length) => {
    let result = length.toString().padStart(4, '0');
    return result;
};

exports.createUser = async (req, res) => {
    const {
        username,
        password,
        name,
        email,
        phone,
        role
    } = req.body
    try {
        if (!username || !password || !name || !phone) {
            return res.status(400).json({ message: "username, password, name and phone is required" })
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "กรุณาใส่รหัสผ่านอย่างน้อย 8 ตัวอักษร" })
        }

        const [users, existUser_username, existUser_email, existUser_phone, existUser_name] = await Promise.all([
            User.find(), 
            User.findOne({ username: username }), 
            User.findOne({ email: email }), 
            User.findOne({ phone: phone }), 
            User.findOne({ name: name })
        ])

        if (existUser_username) {
            return res.status(400).json({ message: "username นี้ มีอยู่ในระบบแล้ว" })
        }
        if (email && email.trim() !== "" && existUser_email) {
            return res.status(400).json({ message: "email นี้ มีอยู่ในระบบแล้ว" })
        }
        if (phone && phone.trim() !== "" && existUser_phone) {
            return res.status(400).json({ message: "หมายเลขโทรศัพท์นี้ มีอยู่ในระบบแล้ว" })
        }
        if (name && name.trim() !== "" && existUser_name) {
            return res.status(400).json({ message: "ชื่อนี้ มีอยู่ในระบบแล้ว" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        let user_count = 1
        if (users.length && !role) {
            const userss = users.filter(u => u.role === 'user')
            user_count = userss.length ? userss[userss.length - 1]?.user_count + 1 : 1
        }
        if (users.length && role === 'admin') {
            const admins = users.filter(u => u.role === 'admin')
            user_count = admins.length ? admins[admins.length - 1]?.user_count + 1 : 1
        }

        const code = role === "admin" ? `AML${generatePaddingCode(user_count)}` : `ML${generatePaddingCode(user_count)}`

        const newUser = new User({
            username: username,
            password: hashedPassword,
            code: code,
            name: name,
            email: email,
            phone: phone,
            user_count: user_count,
            role: role
        })

        await newUser.save()
        return res.status(200).json({ 
            message: "สร้างบัญชีผู้ใช้สำเร็จ",
            status: true,
            data: newUser
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.updateUser = async (req, res) => {
    const {
        name,
        email,
        phone,
        status
    } = req.body

    const { user_id } = req.params
    try {
        if (!name || !phone) {
            return res.status(400).json({ message: "name and phone is required" })
        }

        const [prevUser, existUser_email, existUser_phone, existUser_name] = await Promise.all([
            User.findById( user_id ),
            User.findOne({ email: email }), 
            User.findOne({ phone: phone }), 
            User.findOne({ name: name })
        ])

        if (!prevUser) {
            return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" })
        }

        if (email && email.trim() !== "" && existUser_email && existUser_email._id + "" !== user_id) {
            return res.status(400).json({ message: "email นี้ มีอยู่ในระบบแล้ว" })
        }
        if (phone && phone.trim() !== "" && existUser_phone && existUser_phone._id + "" !== user_id) {
            return res.status(400).json({ message: "หมายเลขโทรศัพท์นี้ มีอยู่ในระบบแล้ว" })
        }
        if (name && name.trim() !== "" && existUser_name && existUser_name._id + "" !== user_id) {
            return res.status(400).json({ message: "ชื่อนี้ มีอยู่ในระบบแล้ว" })
        }

        const updatedUser = await User.findByIdAndUpdate( user_id, {
            $set: {
                name: name || prevUser.name,
                email: email || prevUser.email,
                phone: phone || prevUser.phone,
                status: status || prevUser.status
            }
        }, { new: true }).select("-__v -password")

        return res.status(200).json({
            message: "อัพเดทบัญชีผู้ใช้สำเร็จ",
            status: true,
            data: updatedUser
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.updateUserPassword = async (req, res) => {
    const { new_password } = req.body
    const { user_id } = req.params
    try {
        if (!user_id) {
            return res.status(400).json({ message: "user_id is required" })
        }
        if (!new_password || new_password.trim() === "" || new_password.length < 8) {
            return res.status(400).json({ message: "new_password is required or new_password must be at least 8 characters" })
        }

        const prevUser = await User.findById( user_id )
        if (!prevUser) {
            return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" })
        }

        const hashedPassword = await bcrypt.hash(new_password, 10)

        await User.findByIdAndUpdate( user_id, {
            $set: {
                password: hashedPassword,
            }
        }, { new: true })

        return res.status(200).json({
            message: "อัพเดทรหัสผ่านสำเร็จ",
            status: true
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getUser = async (req, res) => {
    const { user_id } = req.params
    try {
        if (!user_id) {
            return res.status(400).json({ message: "user_id is required" })
        }

        const user = await User.findById( user_id ).select("-password -__v")
        if (!user) {
            return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" })
        }

        return res.status(200).json({
            message: "success",
            status: true,
            data: user
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getUsers = async (req, res) => {
    const { role: user_role } = req.user
    const { status, region, role } = req.query
    try {
        if (!user_role || user_role !== "admin") {
            return res.status(400).json({ message: "คุณไม่ได้รับอนุญาตให้ใช้งาน" })
        }

        let query = {}

        if (!role) {
            query.role = "user"
        } else if (role && role === "all") {
            query = {}
        } else if (role && role === "admin") {
            query.role = "admin"
        }

        if (status) {
            query.status = status
        }

        if (region) {
            query.region = region
        }

        const users = await User.find(query).select("-password -__v")

        return res.status(200).json({
            message: "success",
            amount: users.length,
            status: true,
            data: users
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.deleteUser = async (req, res) => {
    const { role: user_role } = req.user
    const { user_id } = req.params
    try {
        if (!user_id) {
            return res.status(400).json({ message: "user_id is required" })
        }

        if (!user_role || user_role !== "admin") {
            return res.status(400).json({ message: "คุณไม่ได้รับอนุญาตให้ใช้งาน" })
        }

        const deletedUser = await User.findByIdAndDelete( user_id )
        if (!deletedUser) {
            return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" })
        }

        return res.status(200).json({
            message: "delete success",
            status: true,
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}