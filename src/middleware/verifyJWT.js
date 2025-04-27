require("dotenv").config();
const jwt = require("jsonwebtoken");
const verifyJWT = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth?.startsWith("Bearer")) {
    return res.status(401).json({ message: "Header tidak ditemukan" });
  }

  const accessToken = auth.split(" ")[1];
  jwt.verify(accessToken, process.env.SECRET_ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token Tidak Valid" });
    }
    req.yanglogin = decoded;
    console.log(req.yanglogin);
    next();
  });
};

module.exports = verifyJWT;
