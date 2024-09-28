const router = require("express").Router();
const Dropoff = require("../../controller/shipping/dropoffController");
const Delivery = require("../../controller/shipping/deliveryController");

router.post("/dropoffs", Dropoff.createDropoff);
router.put("/dropoffs/:dropoff_id", Dropoff.updateDropoff);
router.get("/dropoffs", Dropoff.getDropoffs);
router.get("/dropoffs/:dropoff_id", Dropoff.getDropoff);

router.post("/deliveries", Delivery.createDelivery);
router.put("/deliveries/:delivery_id", Delivery.updateDelivery);
router.get("/deliveries", Delivery.getDeliveries);
router.get("/deliveries/:delivery_id", Delivery.getDelivery);

module.exports = router