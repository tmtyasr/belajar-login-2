const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_JWT = process.env.SECRET_JWT;

module.exports = function createTokenJWT(data) {
  return jwt.sign(data, SECRET_JWT, {
    expiresIn: "1h",
  });
};
