"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class usersModel extends Model {
    static associate(models) {
      usersModel.belongsToMany(models.teamModel, {
        foreignKey: "user_id ",
        targetKey: "team_id",
        through: models.memberTeamModel,
      });
    }
  }
  usersModel.init(
    {
      user_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNullL: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      api_key: {
        type: DataTypes.TEXT,
      },
      refresh_token: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "usersModel",
      tableName: "users",
      name: {
        singular: "UsersModel",
        plural: "UsersModel",
      },
      timestamps: true,
      paranoid: true,
    }
  );
  return usersModel;
};
