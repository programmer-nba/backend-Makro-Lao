const router = require("express").Router();
const AuthController = require("../../controller/auth/authController")

router.post("/login", AuthController.login)

module.exports = router