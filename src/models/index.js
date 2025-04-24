const db = {};
const { DataTypes } = require("sequelize");
const conn = require("../database/connection");

const usersModel = require("./usersModel");
const teamModel = require("./teamModel");
const membersTeamModel = require("./memberTeamModel");

db.usersModel = usersModel(conn, DataTypes);
db.teamModel = teamModel(conn, DataTypes);
db.membersTeamModel = membersTeamModel(conn, DataTypes);

for (const key of Object.keys(db)) {
  db[key].associate(db);
}

module.exports = db;
