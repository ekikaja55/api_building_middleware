require("dotenv").config();
const jwt = require("jsonwebtoken");
const { teamModel } = require("../models");

  const cekRole = async (req, res, next) => {
  const {team_id} = req.params;

  const cekValidasi = await teamModel.findOne({
    where: {
      team_id :team_id,
    },
    attributes:[
      "team_name",
      "team_captain"
    ]
  });

  if(!cekValidasi){
    return res.status(404).json({message:"Team Tidak Ditemukan"});
  }
  if (req.yanglogin.user.captain_team === null) {
    return res
      .status(404)
      .json({ message: "Member tidak bisa menambahkan member baru, role harus captain" });
  }
  if(cekValidasi.team_captain !== req.yanglogin.user.user_id){
    return res.status(404).json({message:"Hanya captain dari team ini yang bisa menambakan member"})
  }
  req.yanglogin.user.team_id = team_id;
  next();
};

module.exports = cekRole;
