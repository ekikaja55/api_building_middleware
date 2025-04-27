const bcryptjs = require("bcryptjs");
const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const Joi = require("joi");
const { usersModel, teamModel } = require("./src/models");
const jwt = require("jsonwebtoken");
const verifyJWT = require("./src/middleware/verifyJWT");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => res.send("Hello World!"));

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

    return res.status(200).json(addData);
  } catch (error) {
    return res.status(404).json(error.message);
  }
});

//login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await usersModel.findOne({
    where: { username: username },
    attributes: ["user_id", "username", "password", "age", "gender"],
  });

  if (!user) {
    return res.status(404).json({ messages: "username atau password salah" });
  }
  const cekValidation = await bcryptjs.compare(password, user.password);
  if (!cekValidation) {
    return res.status(404).json({ messages: "gagal login" });
  }
  user.password = undefined;
  const accessToken = jwt.sign({ user }, process.env.SECRET_ACCESS_TOKEN, {
    expiresIn: "30s",
  });
  const refreshToken = jwt.sign({ user }, process.env.SECRET_REFRESH_TOKEN, {
    expiresIn: "1d",
  });

  await user.update({
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
    return res.status(201).json(addData);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
