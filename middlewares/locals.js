const Messages = require("../models/messages");

async function setGlobals(req, res, next) {
  try {
    const unreadMessagesCount = await Messages.count({
      where: {
        isRead: false,
        sendType: "customer",
      },
    });
    
    res.locals.unreadMessagesCount = unreadMessagesCount;
    res.locals.isAuth = req.session.isAuth;
    res.locals.name = req.session.name;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { setGlobals };
