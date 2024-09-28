const router = require("express").Router();
//const { auth } = require("../../middleware/auth");
const { getProducts, getCategories } = require("../../controller/product/product_controller");

router.post("/products", getProducts);
router.post("/categories", getCategories);

module.exports = router