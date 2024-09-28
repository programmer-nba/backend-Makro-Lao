const { Delivery } = require("../../model/delivery/deliveryModel");

exports.createDelivery = async (req, res) => {
    const { name } = req.body;
    const delivery = new Delivery({ name });
    await delivery.save();
    return res.status(200).json({ data: delivery });
}

exports.updateDelivery = async (req, res) => {
    const { name } = req.body;
    const { delivery_id } = req.params;
    let delivery = await Delivery.findById(delivery_id);
    if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
    }
    delivery.name = name;
    await delivery.save();
    return res.status(200).json({ data: delivery });
}

exports.getDeliveries = async (req, res) => {
    const deliveries = await Delivery.find();
    return res.status(200).json({ data: deliveries });
}

exports.getDelivery = async (req, res) => {
    const { delivery_id } = req.params;
    const delivery = await Delivery.findById(delivery_id);
    if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
    }
    return res.status(200).json({ data: delivery });
}