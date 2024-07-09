const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Suggestion = sequelize.define("suggestion", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
}, {
    timestamps: false, 
});

module.exports = Suggestion;
