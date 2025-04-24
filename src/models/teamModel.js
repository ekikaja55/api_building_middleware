"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class teamModel extends Model {
    static associate(models) {}
  }
  teamModel.init(
    {
      team_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      team_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      team_captain: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "teamModel",
      tableName: "teams",
      name: {
        singular: "TeamModel",
        plural: "TeamModel",
      },
      paranoid: true,
      timestamps: true,
    }
  );
  return teamModel;
};
