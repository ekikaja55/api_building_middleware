const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/api/register", (req, res) => {
  return res.status(200).json("masuk");
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
