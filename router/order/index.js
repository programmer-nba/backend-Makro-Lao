const router = require("express").Router();
const Order = require("../../controller/order/orderController");
const { auth } = require("../../middleware/auth")

router.post("/orders", auth, Order.createOrder);
router.put("/orders/:order_id", auth, Order.updateOrder);
router.get("/orders", auth, Order.getOrders);
router.get("/orders/:order_id", auth, Order.getOrder);
router.post('/upload', Order.uploadSlip);

router.get("/admin/orders", Order.getOrdersAdmin);
router.get("/admin/orders/:order_id", Order.getOrderAdmin);
router.put("/admin/orders/:order_id", Order.updateOrderAdmin);

module.exports = router;
