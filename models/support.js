const sequelize = require("../data/db")
const {DataTypes} = require("sequelize");

const Support = sequelize.define("support",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    socketId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

module.exports = Support;