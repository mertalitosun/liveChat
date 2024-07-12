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
        type:DataTypes.STRING(20),
        allowNull:false,
        validate: {
            len: [1, 20], 
          },
    },
    isConnect:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    }
})

module.exports = Customer;