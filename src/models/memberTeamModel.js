"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class memberTeamModel extends Model {
    static associate(models) {
      memberTeamModel.belongsTo(models.usersModel,{
        foreignKey:"id_user",
      })
    }
  }
  memberTeamModel.init(
    {
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement:true,
      },
      team_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      id_user: {
        type: DataTypes.BIGINT,
        allowNull:false,

      },
    },
    {
      sequelize,
      modelName: "memberTeamModel",
      tableName: "members_team",
      name: {
        singular: "MemberTeamModel",
        plural: "MemberTeamModel",
      },
      timestamps: true,
      paranoid: true,
    }
  );
  return memberTeamModel;
};
