"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class teamModel extends Model {
    static associate(models) {
      teamModel.belongsToMany(models.usersModel, {
        foreignKey: "team_id",
        targetKey: "user_id",
        through: models.memberTeamModel,
      });
      teamModel.belongsTo(models.usersModel, {
        foreignKey: "team_captain",
      });
    }
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
