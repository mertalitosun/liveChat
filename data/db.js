const Sequelize = require("sequelize");
const config = require("../config");
const sequelize = new Sequelize(config.db.databse,config.db.user,config.db.password,{
    host:config.db.host,
    dialect: "mysql",
    timezone: '+03:00',
    storage: "./session.mysql",
})

const connection = async()=>{
    try{
        await sequelize.authenticate()
        console.log(config.db.databse, " veritabanına bağlandı.");
    }catch(err){
        console.log("veritabanı bağlantı hatası: ", err)
    }
}
connection();
module.exports = sequelize;