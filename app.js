const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const sequelize = require("./data/db");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const locals = require("./middlewares/locals");



const Customer = require("./models/customer");
const Support = require("./models/support");
const Messages = require("./models/messages");

Messages.belongsTo(Customer, { foreignKey: 'customerId' });
Messages.belongsTo(Support, { foreignKey: 'supportId' });

app.set("view engine", "ejs");
app.use(express.static("node_modules"));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(session({
  secret: "hello world",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 30 * 60
  },
  store: new SequelizeStore({
    db: sequelize,
    expiration: 1000 * 60 * 30,
    checkExpirationInterval: 1000 * 60 * 30 
  })
}));
app.use(locals)
// Routes
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
app.use(adminRoutes);
app.use(authRoutes);
app.use(userRoutes);


// (async () => {
//   await sequelize.sync({ force: true });
// })();


// Socket.io
const server = http.createServer(app);

const socketHandler = require("./helpers/socket");
const io = socketHandler(server);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı.`);
});
