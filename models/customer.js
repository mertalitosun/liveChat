const sequelize = require("../data/db");
const {DataTypes} = require("sequelize");

const Customer = sequelize.define("customer",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    socketId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    sessionId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

module.exports = Customer;