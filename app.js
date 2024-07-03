const express = require("express");
const app = express();
const path = require("path");
const http = require("http");

// Middleware ve statik dosyalar
app.set("view engine", "ejs");
app.use(express.static("node_modules"));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Veritabanı modelleri
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

const server = http.createServer(app);

const socketHandler = require("./helpers/socket");
const io = socketHandler(server);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı.`);
});
