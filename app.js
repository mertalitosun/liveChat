const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

app.set("view engine", "ejs");
app.use(express.static("node_modules"));
app.use("/static", express.static(path.join(__dirname, "public")));

// veritabanı
const Customer = require("./models/customer"); 
const Support = require("./models/support");
const Messages = require("./models/messages");

// async function databaseReset (){

//   await Customer.sync({ force: true })
//   await Messages.sync({ force: true })
// }
// databaseReset()

// Routes
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
app.use(userRoutes);
app.use(adminRoutes);

// Socket.io
const server = http.createServer(app);
const io = new Server(server);

const CUSTOMER_ROOM = "customer_room";
const SUPPORT_ROOM = "support_room";

io.on("connection", (socket) => {
  console.log("Bir kullanıcı bağlandı");

  socket.on("customer message", async (data) => {
    const { nameValue, inputValue } = data;
    const socketId = socket.id;
  
    try {
      let customer = await Customer.findOne({ where: { socketId } });
  
      if (!customer) {
        customer = await Customer.create({
          socketId: socketId,
          name: nameValue
        });
      }
  
      const message = await Messages.create({
        message: inputValue,
        sendType: 'customer',
        customerId: customer.id,
        supportId: 1  
      });
  
      const customerId = customer.id;
      const customerName = customer.name;
      const customerMessage = message.message;
  
      io.to(SUPPORT_ROOM).emit("customer message", { customerId, name: customerName, message: customerMessage });
      io.to(socketId).emit("customer message", { name: customerName, message: customerMessage });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("support message", async(data) => {
    const { customerId, inputValue } = data;
  
    try {
      const customer = await Customer.findByPk(customerId);
  
      const message = await Messages.create({
        message: inputValue,
        sendType: 'support',
        customerId: customerId,
        supportId: 1 
      });
      io.to(customer.socketId).emit("support message", { inputValue });
  
      io.to(SUPPORT_ROOM).emit("support message", { customerId, inputValue });
    } catch (err) {
      console.log(err);
    }
  });
  

  socket.on("join room", async(room) => {
    socket.join(room);
    console.log(`Kullanıcı ${room} odasına katıldı`);
  });
  
  socket.on("get message history", async (customerId, callback) => {
    try {
      const history = await Messages.findAll({
        where: {
          customerId: customerId
        }
      });
      const customers = await Customer.findAll({
        where: {
          id: customerId
        }
      });
      callback(history,customers);
    } catch (err) {
      console.log("Mesaj geçmişi alma hatası", err);
      callback([]);
    }
  });


  socket.on("typing", (data) => {
    const { customerId, status } = data;
    if (customerId) {
      io.to(customerId).emit("display typing", { status });
    } else {
      io.to(SUPPORT_ROOM).emit("display typing", { status });
    }
  });

  socket.on("stop typing", (data) => {
    const { customerId, status } = data;
    if (customerId) {
      io.to(customerId).emit("hide typing", { status });
    } else {
      io.to(SUPPORT_ROOM).emit("hide typing", { status });
    }
  });
  
  socket.on("disconnect", () => {
    console.log("Kullanıcı çıktı");
  });
});

server.listen(3000, () => {
  console.log("3000 portuna bağlanıldı.");
});