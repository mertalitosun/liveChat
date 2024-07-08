const { Server } = require("socket.io");
const Customer = require("../models/customer");
const Support = require("../models/support");
const Messages = require("../models/messages");

const { v4: uuidv4 } = require('uuid');

function generateSessionId() {
  return uuidv4();
}

const CUSTOMER_ROOM = "customer_room";
const SUPPORT_ROOM = "support_room";
let supportUsers = 0;

const sessionTimeout = 3 * 60 * 1000;

let sessionTimers = {};

const socketHandler = (server) => {
  const io = new Server(server);
  io.on("connection", (socket) => {
    let socketId = socket.id;
    let sessionId = generateSessionId();
    console.log("*****üretilen sessionId*******",sessionId)
    console.log("***Yeni Bir kullanıcı bağlandı", socketId);
  
    
    socket.on("checkLocalStorage", async (existingSocketId) => {
      console.log("localStorage", existingSocketId);
      if (existingSocketId) {
        sessionId = existingSocketId;
      } else {
        sessionId = sessionId;
        socket.emit("addToLocalStorage", { sessionId: sessionId });
      }
      try {
        const customer = await Customer.findOne({ where: { sessionId } });
        if (customer) {
          if (customer.socketId !== socket.id) {
            customer.socketId = socket.id;
            await customer.save();
          }
          const history = await Messages.findAll({
            where: { customerId: customer.id },
          });
         
          socket.emit("get message history", history, customer);
        }
      } catch (err) {
        console.log("Geçmiş mesajları alma hatası:", err);
      }
    });

    const startSessionTimer = () => {
      sessionTimers[sessionId] = setTimeout(() => {
        socket.emit("deleteToLocalStorage");
        socket.emit("sessionTimeout", { message: "Oturumunuz zaman aşımına uğradı. Lütfen tekrar bağlanın." }); 
        socket.disconnect(true);
      }, sessionTimeout);
    };

    startSessionTimer();

    socket.on("customer message", async (data) => {

      if (sessionTimers[sessionId]) {
        clearTimeout(sessionTimers[sessionId]);
      }
      startSessionTimer();
      const { inputValue, nameValue} = data;
      try {
        let customer = await Customer.findOne({ where: { sessionId } });
        if (!customer) {
          customer = await Customer.create({
            socketId: socketId,
            sessionId: sessionId,
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
          io.to(customer.socketId).emit("customer message", {
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
          io.to(customer.socketId).emit("support message", {
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
      const customer = await Customer.findByPk(customerId);
      if (!customer || !io.sockets.sockets.has(customer.socketId)) {
        console.log("Müşteri bağlı değil, mesaj gönderilemedi.");
        return;
      }
      try {
        if(inputValue){
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
        }
        
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("join room", async (room) => {
      socket.join(room);
      console.log(`${socketId} Kullanıcı ${room} odasına katıldı`);
      if (room === SUPPORT_ROOM) {
        supportUsers++;
        io.to(CUSTOMER_ROOM).emit("support online", { count: supportUsers });
      }
      console.log("Destek Odası>>>>>>>>>>>>>>>>>>>",io.sockets.adapter.rooms.get(SUPPORT_ROOM))
      console.log("Müşteri Odası>>>>>>>>>>>>>>>>>>>",io.sockets.adapter.rooms.get(CUSTOMER_ROOM))
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
        io.to(SUPPORT_ROOM).emit("display typing", { customerId, status });
      }
    });
    
    socket.on("stop typing", (data) => {
      const { customerId, status } = data;
      if (customerId) {
        io.to(customerId).emit("hide typing", { status });
      } else {
        io.to(SUPPORT_ROOM).emit("hide typing", { customerId, status });
      }
    });
   
    //Görüşme sonlandırma
    socket.on("end chat", async(data) => {
      const { customerId } = data;
      const customer = await Customer.findOne({ where: { id:customerId } });
      if (customer) {
        io.to(customer.socketId).emit("chat ended"); 
      }
    });
    
    socket.on("disconnect", () => {
      console.log("Kullanıcı çıktı");
    });
  });

  return io;
};

module.exports = socketHandler;
