const { Server } = require("socket.io");
const Customer = require("../models/customer");
const Support = require("../models/support");
const Messages = require("../models/messages");

const CUSTOMER_ROOM = "customer_room";
const SUPPORT_ROOM = "support_room";
let supportUsers = 0;

const sessionTimeout = 3 * 60 * 1000;
let sessionTimers = {};

const socketHandler = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Bir kullanıcı bağlandı");

    const startSessionTimer = () => {
      const userId = socket.id;
      socket.emit("addToLocalStorage", ({ userId }));
      sessionTimers[userId] = setTimeout(() => {
        socket.emit("deleteToLocalStorage");
        socket.disconnect(true);
        console.log(`Kullanıcı ${userId} oturum zaman aşımına uğradı`);
      }, sessionTimeout);
    };

    startSessionTimer();

    socket.on("customer message", async (data) => {
      const userId = socket.id;
      if (sessionTimers[userId]) {
        clearTimeout(sessionTimers[userId]);
      }
      startSessionTimer();
      const { nameValue, inputValue } = data;
      const socketId = socket.id;

      try {
        let customer = await Customer.findOne({ where: { socketId } });

        if (!customer) {
          customer = await Customer.create({
            socketId: socketId,
            name: nameValue,
          });
        }

        const previousMessages = await Messages.findOne({
          where: {
            customerId: customer.id,
          },
        });

        const customerSendMessage = async () => {
          const message = await Messages.create({
            message: inputValue,
            sendType: "customer",
            customerId: customer.id,
            supportId: 1,
            isRead: 0,
          });
          const customerId = customer.id;
          const customerName = customer.name;
          const customerMessage = message.message;
          const sendDate = message.createdAt;

          io.to(SUPPORT_ROOM).emit("customer message", {
            customerId,
            name: customerName,
            message: customerMessage,
            sendDate,
          });
          io.to(socketId).emit("customer message", {
            name: customerName,
            message: customerMessage,
            sendDate,
          });
        };

        await customerSendMessage();

        if (!previousMessages) {
          // otomatik mesaj
          const autoMessage = await Messages.create({
            message: "Merhaba, nasıl yardımcı olabilirim?",
            sendType: "support",
            customerId: customer.id,
            supportId: 1,
            isRead: 0,
          });
          io.to(SUPPORT_ROOM).emit("support message", {
            customerId: customer.id,
            inputValue: autoMessage.message,
            sendDate: autoMessage.createdAt,
          });
          io.to(socketId).emit("support message", {
            inputValue: autoMessage.message,
            sendDate: autoMessage.createdAt,
          });
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("support message", async (data) => {
      const { customerId, inputValue } = data;
      try {
        const customer = await Customer.findByPk(customerId);
        const message = await Messages.create({
          message: inputValue,
          sendType: "support",
          customerId: customerId,
          supportId: 1,
          isRead: 0,
        });
        const sendDate = message.createdAt;
        io.to(customer.socketId).emit("support message", {
          inputValue,
          sendDate,
        });
        io.to(SUPPORT_ROOM).emit("support message", {
          customerId,
          inputValue,
          sendDate,
        });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("join room", async (room) => {
      socket.join(room);
      console.log(`Kullanıcı ${room} odasına katıldı`);
      if (room === SUPPORT_ROOM) {
        supportUsers++;
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>", supportUsers);
        io.to(CUSTOMER_ROOM).emit("support online", { count: supportUsers });
      }
    });

    socket.on("get message history", async (customerId, callback) => {
      try {
        const history = await Messages.findAll({
          where: {
            customerId: customerId,
          },
        });
        const customers = await Customer.findAll({
          where: {
            id: customerId,
          },
        });
        callback(history, customers);
      } catch (err) {
        console.log("Mesaj geçmişi alma hatası", err);
        callback([]);
      }
    });

    socket.on("mark messages read", async (customerId) => {
      try {
        await Messages.update(
          { isRead: 1 },
          { where: { customerId, isRead: 0 } }
        );
      } catch (err) {
        console.log(err);
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

    socket.on('file message', async function(data) {
      const { fileData, fileName, fileType } = data;
      console.log(`Yeni dosya: ${fileName}`);
    });
    
    socket.on("disconnect", () => {
      console.log("Kullanıcı çıktı");
      socket.emit("deleteToLocalStorage");
    });
  });

  return io;
};

module.exports = socketHandler;
