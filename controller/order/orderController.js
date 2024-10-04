const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Order = require("../../model/order/orderModel");
// const { storage } = require("../../middleware/uploadSlip");
const { User } = require("../../model/user/userModel");
const { Delivery } = require("../../model/delivery/deliveryModel");
const { SlipPayment } = require("../../model/order/slipPaymentModel");
const dayjs = require("dayjs");
require("dayjs/locale/th");
const buddhistEra = require("dayjs/plugin/buddhistEra");

dayjs.extend(buddhistEra);

const uploadFolder = path.join(__dirname, "../../uploads/slips");
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const order_id = req.body.order_id
    const filename = `slip_order_${order_id}.jpg`;
    cb(null, filename);
  },
  
});

const generatePaddingCode = (length) => {
  let result = length.toString().padStart(4, "0");
  return result;
};

const dateCodeTh = () => {
  const date = new Date();
  dayjs.locale("th");
  return dayjs(date).format("BBMMDD");
};

var all_items = [];

const fetchItems = async () => {
  try {
    const [response, response2] = await Promise.all([
      axios.post(`${process.env.PRODUCTS_URL}/api_product`, null, {
        headers: {
          "auth-token": process.env.PRODUCTS_TOKEN,
        },
      }),
      axios.post(`${process.env.PRODUCTS_URL}/api_product/category`, null, {
        headers: {
          "auth-token": process.env.PRODUCTS_TOKEN,
        },
      }),
    ]);

    const items = response.data;
    const categories = response2.data?.data;

    const products = items?.map((item) => {
      const category = categories?.find((c) => c._id === item.product_category);
      return {
        ...item,
        category_name: category?.name,
      };
    });
    all_items = products;
  } catch (err) {
    console.log(err.message);
    //return false
  }
};

exports.createOrder = async (req, res) => {
  const {
    line_items,
    dropoff_id,
    delivery_id,
    shipping,
    paymentChannel,
    deliveryBranch,
    status,
  } = req.body;
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }

    let items_price = 0;
    let cod_percent = 3;
    let cod_price = 0;
    let net_price = 0;

    if (line_items && line_items.length) {
      const prices = line_items.map((item) => item.ppu * item.quantity);
      items_price = prices.reduce((a, b) => a + b, 0);
      cod_price = items_price * (cod_percent / 100);
      net_price = items_price + cod_price;
    }

    if (cod_price < 30) {
      cod_price = 30;
    }

    let order_count = 1;
    const orders = await Order.find();
    if (orders.length) {
      order_count = orders.length + 1;
    }

    let code = `MLO-${dateCodeTh()}-${generatePaddingCode(order_count)}`;

    const newOrder = new Order({
      code: code,
      user_id: user._id,
      line_items: line_items,
      items_price: items_price,
      cod_percent: cod_percent,
      cod_price: cod_price,
      net_price: net_price,
      dropoff_id: dropoff_id,
      delivery_id: delivery_id,
      currency: "THB",
      shipping: shipping,
      paymentChannel: paymentChannel,
      deliveryBranch: deliveryBranch,
      status: status,
    });
    const savedOrder = await newOrder.save();

    return res.status(200).json({
      message: "success",
      status: true,
      data: savedOrder,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  const { status } = req.body;
  const { order_id } = req.params;
  try {
    const prevOrder = await Order.findById(order_id);
    if (!prevOrder) {
      return res.status(404).json({ message: "ไม่พบรายการสั่งซื้อ" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      {
        $set: {
          status: status >= 0 ? status : prevOrder.status,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "success",
      status: true,
      data: updatedOrder,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  const { _id: user_id } = req.user;
  try {
    if (!user_id) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }
    const orders = await Order.find({ user_id: user_id });
    
    await fetchItems();

    const orderFormats = orders.map(async (order) => {
      const delivery = await Delivery.findById(order.delivery_id);
      const _items = order.line_items.map((item) => {
        const product = all_items.find(
          (product) => product.product_id === item.product_id
        );
        return {
          ...item._doc,
          product_category: product.product_category,
          category_name: product.category_name,
          product_name: product.product_name,
          product_image: product.product_image,
          product_barcode: product.product_barcode,
        };
      });
      return {
        ...order._doc,
        _items: _items,
        delivery: delivery?.name|| "Unknown Delivery",
      };
    });

    const promiseOrders = await Promise.all(orderFormats);

    return res.status(200).json({
      message: "success",
      status: true,
      data: promiseOrders,
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  const { order_id } = req.params;
  try {
    if (!order_id) {
      return res.status(400).json({ message: "ไม่พบ order_id" });
    }
    const order = await Order.findById(order_id).select("-__v");
    if (!order) {
      return res.status(404).json({ message: "ไม่พบรายการสั่งซื้อ" });
    }

    const slipPayment = await SlipPayment.findOne({ order_id: order._id });

    const delivery = await Delivery.findById(order.delivery_id);

    await fetchItems();
    const _items = order.line_items.map((item) => {
      const product = all_items.find(
        (product) => product.product_id === item.product_id
      );
      return {
        ...item._doc,
        product_category: product.product_category,
        category_name: product.category_name,
        product_name: product.product_name,
        product_image: product.product_image,
        product_barcode: product.product_barcode,
      };
    });

    return res.status(200).json({
      message: "success",
      status: true,
      data: {
        ...order._doc,
        _items: _items,
        delivery: delivery?.name || "Unknown Delivery",
        slipPayment: slipPayment
          ? {
              slipImageUrl: slipPayment.slipImageUrl,
              amount: slipPayment.amount,
              date: slipPayment.date,
              time: slipPayment.time,
            }
          : null,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const { order_id } = req.params;
  const { role: user_role } = req.user;
  try {
    if (!order_id) {
      return res.status(400).json({ message: "ไม่พบ order_id" });
    }
    if (!user_role || user_role !== "admin") {
      return res.status(400).json({ message: "คุณไม่ได้รับอนุญาตให้ใช้งาน" });
    }
    const deletedOrder = await Order.findByIdAndDelete(order_id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "ไม่พบรายการสั่งซื้อ" });
    }

    return res.status(200).json({
      message: "delete success",
      status: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getOrdersAdmin = async (req, res) => {
  //const { _id: user_id } = req.user
  try {
    /* if (!user_id) {
            return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" })
        } */
    const orders = await Order.find();

    await fetchItems();

    const orderFormats = orders.map(async (order) => {
      const delivery = await Delivery.findById(order.delivery_id);
      const user = await User.findById(order.user_id).select(
        "-password -__v -createdAt -updatedAt -status -user_count"
      );
      const _items = order.line_items.map((item) => {
        const product = all_items.find(
          (product) => product.product_id === item.product_id
        );
        return {
          ...item._doc,
          product_category: product.product_category,
          category_name: product.category_name,
          product_name: product.product_name,
          product_image: product.product_image,
          product_barcode: product.product_barcode,
        };
      });
      //console.log(_items)
      return {
        ...order._doc,
        _items: _items,
        delivery: delivery?.name || "Unknown Delivery",
        user_data: user,
      };
    });

    const promiseOrders = await Promise.all(orderFormats);

    return res.status(200).json({
      message: "success",
      status: true,
      data: promiseOrders,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getOrderAdmin = async (req, res) => {
  const { order_id } = req.params;
  try {
    if (!order_id) {
      return res.status(400).json({ message: "ไม่พบ order_id" });
    }
    const order = await Order.findById(order_id).select("-__v");
    if (!order) {
      return res.status(404).json({ message: "ไม่พบรายการสั่งซื้อ" });
    }

    await fetchItems();

    const delivery = await Delivery.findById(order.delivery_id);
    const user = await User.findById(order.user_id).select(
      "-password -__v -createdAt -updatedAt -status -user_count"
    );
    const _items = order.line_items.map((item) => {
      const product = all_items.find(
        (product) => product.product_id === item.product_id
      );
      return {
        ...item._doc,
        product_category: product.product_category,
        category_name: product.category_name,
        product_name: product.product_name,
        product_image: product.product_image,
        product_barcode: product.product_barcode,
      };
    });

    return res.status(200).json({
      message: "success",
      status: true,
      data: {
        ...order._doc,
        _items: _items,
        delivery: delivery?.name|| "Unknown Delivery",
        user_data: user,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.updateOrderAdmin = async (req, res) => {
  const { status } = req.body;
  const { order_id } = req.params;
  try {
    const prevOrder = await Order.findById(order_id);
    if (!prevOrder) {
      return res.status(404).json({ message: "ไม่พบรายการสั่งซื้อ" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      {
        $set: {
          status: status >= 0 ? status : prevOrder.status,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "success",
      status: true,
      data: updatedOrder,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.uploadSlip = (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("image");
    upload(req, res, async function (err) {
      if (err) {
        return res.status(500).send(err);
      }

      const { amount, date, time, order_id } = req.body;

      if (!amount || !date || !time || !order_id) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      let image = "";

      if (req.file) {
        const url = "/uploads/slips";
        image = url + "/slip_order_" + order_id + ".jpg";
      } else {
        return res.json({
          message: "No file uploaded",
          status: false,
        });
      }
      console.log(image)
      const newSlipPayment = new SlipPayment({
        order_id,
        amount,
        date,
        time,
        slipImageUrl: image,
      });

      await newSlipPayment.save();
    
      fs.renameSync(req.file.path, req.file.path.replace('undefined', order_id));
      res
        .status(200)
        .json({
          success: true,
          message: "Payment slip uploaded successfully",
          data: req.file,
        });
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};