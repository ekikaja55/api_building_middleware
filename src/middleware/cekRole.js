require("dotenv").config();
const jwt = require("jsonwebtoken");
const { teamModel } = require("../models");

const cekRole = async (req, res, next) => {
  console.log(
    "ini lanjutan request dari middleware sebelumnya",
    req.yanglogin.user
  );
  const cekValidasi = await teamModel.findOne({
    where: {
      team_captain: req.yanglogin.user.user_id,
    },
  });
  if (!cekValidasi ) {
    return res
      .status(404)
      .json({ message: "Hanya captain yang bisa menambah member" });
  }
  next();
};

module.exports = cekRole;
