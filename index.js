const bcryptjs = require("bcryptjs");
const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const Joi = require("joi");
const { usersModel, teamModel, memberTeamModel } = require("./src/models");
const jwt = require("jsonwebtoken");
const verifyJWT = require("./src/middleware/verifyJWT");
const cekRole = require("./src/middleware/cekRole");
const { where } = require("sequelize");

require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => res.send("Test"));

//==================================================================================================//

//register
app.post("/api/register", async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required().min(5).label("username").messages({
      "any.required": "{#label} field harus ada",
      "string.empty": "{#label} tidak boleh kosong",
      "string.min": "{#label} harus minimal 5 karakter",
    }),
    password: Joi.string().required().min(5).label("password").messages({
      "any.required": "{#label} field harus ada",
      "string.empty": "{#label} tidak boleh kosong",
      "string.min": "{#label} harus minimal 5 karakter",
    }),
    age: Joi.number().required().max(70).label("age").messages({
      "any.required": "{#label} field harus ada",
      "number.base": "{#label} harus angka",
      "number.max": "{#label} tidak boleh lebih dari 70 tahun",
    }),
    gender: Joi.string()
      .required()
      .valid("male", "female")
      .label("gender")
      .messages({
        "any.required": "{#label} field harus ada",
        "string.empty": "{#label} tidak boleh kosong",
        "any.only": "{#label} harus diisi male atau female",
      }),
  });

  try {
    let inputan = await schema.validateAsync(req.body, {
      abortEarly: false,
    });
    const hashPass = await bcryptjs.hash(inputan.password, 10);
    const apiKey = crypto.randomUUID();
    const user = await usersModel.findOne({
      where: {
        username: inputan.username,
      },
    });

    if (user) {
      return res.status(400).json({
        messages: "username already registered",
      });
    }
    const addData = await usersModel.create({
      username: inputan.username,
      password: hashPass,
      age: inputan.age,
      gender: inputan.gender,
      api_key: apiKey,
    });

    return res.status(200).json({
      username : addData.username,
      password : addData.password,
      age:addData.age,
      api_key:addData.api_key,
    });
  } catch (error) {
    return res.status(404).json(error.message);
  }
});

//login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const data = await usersModel.findOne({
    where: { username: username },
    attributes: ["user_id", "username", "password", "age", "gender"],
    include: {
      model: teamModel,
      attributes: ["team_id", "team_name", "team_captain"],
    },
  });
  if (!data) {
    return res.status(404).json({ messages: "username atau password salah" });
  }
  const cekValidation = await bcryptjs.compare(password, data.password);
  if (!cekValidation) {
    return res.status(404).json({ messages: "gagal login" });
  }

  const user = {
    user_id: data.user_id,
    username: data.username,
    age: data.age,
    gender: data.gender,
    captain_team: data.TeamModel[0]
      ? data.TeamModel[0].team_name
      : null,
  };

  const accessToken = jwt.sign({ user }, process.env.SECRET_ACCESS_TOKEN, {
    expiresIn: "30s",
  });
  const refreshToken = jwt.sign({ user }, process.env.SECRET_REFRESH_TOKEN, {
    expiresIn: "1d",
  });

  await data.update({
    refresh_token: refreshToken,
  });

  res.cookie("userCookies", refreshToken, {
    httpOnly: true,
    maxAge: 60 * 1000,
  });

  return res.status(201).json({
    message: "sukses login",
    token: accessToken,
  });
});

//tugas nomor 1
app.post("/api/teams", [verifyJWT], async (req, res) => {
  const schema = Joi.object({
    team_name: Joi.string().required().min(3).messages({
      "string.empty": "Input cannot be empty",
      "string.min": " Your team name must contain at least 3 characters ",
    }),
  });
  try {
    let inputan = await schema.validateAsync(req.body, {
      abortEarly: false,
    });
    const addData = await teamModel.create({
      team_id: `T${((await teamModel.count()) + 1)
        .toString()
        .padStart(3, "0")}`,
      team_name: inputan.team_name,
      team_captain: req.yanglogin.user.username,
    });
    return res.status(201).json({
      team_id: addData.team_id,
      team_name: addData.team_name,
      team_captain: addData.team_captain,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

//tugas nomor 2
app.put("/api/teams/:team_id", [verifyJWT, cekRole], async (req, res) => {
  const {new_members} = req.body;

  if(new_members == req.yanglogin.user.user_id){
    return res.status(404).json({message: "Tidak bisa menambahkan ID pribadi karena sudah menjadi kapten"})
  }

  const validateMember = await usersModel.findOne({
    where:{
      user_id:new_members
    },
    attributes:[
      "user_id",
      "username",
    ]
  })
  if(!validateMember){

    return res.status(404).json({message:`Member dengan ID ${new_members} tidak ditemukan`})
  }

  const cekMember = await memberTeamModel.findOne({
    where:{
      team_id:req.yanglogin.user.team_id,
      id_user:validateMember.user_id,
    },
    attributes:[
      "team_id",
      "id_user"
    ]
  })

  if(cekMember){
    return res.status(404).json({message:`Member dengan ID ${cekMember.id_user} sudah terdaftar di team ini`})
  }

  await memberTeamModel.create({
    team_id: req.yanglogin.user.team_id,
    id_user: validateMember.user_id,
  })
  return res.status(200).json({
    message:`The following user(s) has been added to the team ${req.yanglogin.user.captain_team}`,
    new_team_members:[
      {
        user_id:validateMember.user_id,
        display_name:validateMember.username,
      }
    ]
  });
});


//tugas nomor 3

app.get("/api/teams/:team_id",async (req,res)=>{
 const {team_id} = req.params;

  const dataTeam = await teamModel.findOne({
    where:{
    team_id:team_id,
    },
    attributes:["team_id","team_name",],
    include:{
      model: usersModel,
      attributes:["user_id","username"]
    }
  })

  if (!dataTeam){
    return res.status(200).json({message:"Team tidak ditemukan"})
  }

  const dataIdMember = await memberTeamModel.findAll({
    where:{
      team_id:team_id,
    },
    attributes:[
      "id_user",
    ],
    include:{
      model:usersModel,
    attributes:[
      "username",
      "user_id"
    ]
    }
  })

 return res.status(200).json({
   team_id:dataTeam.team_id,
   team_name:dataTeam.team_name,
   team_captain:dataTeam.UsersModel,
   members: dataIdMember.map((item)=>{
     return {
       user_id:item.UsersModel.user_id,
       username:item.UsersModel.username
     }
   }),
 })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
