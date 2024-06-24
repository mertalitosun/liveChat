const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

app.set("view engine", "ejs");
app.use(express.static("node_modules"));
app.use("/static", express.static(path.join(__dirname, "public")));

// Routes
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
app.use(userRoutes);
app.use(adminRoutes);

// Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Oda isimleri
const CUSTOMER_ROOM = "customer_room";
const SUPPORT_ROOM = "support_room";

// Mesaj geçmişini tutacak obje
let messageHistory = {};

io.on("connection", (socket) => {
  console.log("Bir kullanıcı bağlandı");

  socket.on("customer message", (data) => {
    const { nameValue, inputValue } = data;
    const customerId = socket.id;

    if (!messageHistory[customerId]) {
      messageHistory[customerId] = [];
    }
    messageHistory[customerId].push({ type: "customer", name: nameValue, message: inputValue });

    io.to(SUPPORT_ROOM).emit("customer message", { customerId, name: nameValue, message: inputValue });

    io.to(customerId).emit("customer message", { name: nameValue, message: inputValue });
  });

  socket.on("support message", (data) => {
    const { customerId, message } = data;

    if (!messageHistory[customerId]) {
      messageHistory[customerId] = [];
    }
    messageHistory[customerId].push({ type: "support", message });

    io.to(customerId).emit("support message", { message });

    io.to(SUPPORT_ROOM).emit("support message", { customerId, message });
  });

  socket.on("join room", (room) => {
    socket.join(room);
    console.log(`Kullanıcı ${room} odasına katıldı`);
  });

  socket.on("get message history", (customerId, callback) => {
    callback(messageHistory[customerId] || []);
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı çıktı");
  });
});

server.listen(3000, () => {
  console.log("3000 portuna bağlanıldı.");
});
