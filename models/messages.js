const sequelize = require("../data/db")
const {DataTypes} = require("sequelize")

const Messages = sequelize.define("messages",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    message:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    sendType:{
        type:DataTypes.ENUM("customer", "support"),
        allowNull:false
    },
    customerId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    supportId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
});

module.exports = Messages