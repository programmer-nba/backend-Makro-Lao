const express = require("express");
var path = require('path');
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + '/.env' });

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection");

    ws.on("message", (message) => {
        console.log("Received message:", message);
    });

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});

// WebSocket endpoint for payment status
wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const uuid = url.pathname.split('/').pop(); // Extract UUID from URL

    console.log(`WebSocket connection for payment status with UUID: ${uuid}`);

    // Simulate payment status update (for example purposes)
    const paymentStatus = {
        uuid: uuid,
        status: "paid",
        timestamp: new Date().toISOString()
    };

    // Send a payment status update to the client
    ws.send(JSON.stringify(paymentStatus));

    // Simulate status update every 5 seconds (remove or replace with real logic)
    const interval = setInterval(() => {
        const updatedStatus = {
            ...paymentStatus,
            timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(updatedStatus));
    }, 5000);

    ws.on("close", () => {
        clearInterval(interval);
        console.log(`WebSocket connection closed for UUID: ${uuid}`);
    });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Makro Lao server is running");
});

const prefix = "/makrolao/api/v1";

app.use(prefix+'/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(prefix, require("./router/login"));
app.use(prefix, require("./router/user"));
app.use(prefix, require("./router/shipping"));
app.use(prefix, require("./router/order"));
app.use(prefix, require("./router/payment"));
app.use(prefix, require("./router/product"));

const PORT = process.env.PORT || 2233;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});