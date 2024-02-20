const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_JWT = process.env.SECRET_JWT;

module.exports = function authenticateToken(req, res, next) {
  // Ambil token dari header Authorization
  const token = req.headers["authorization"] || req.cookies.access_token;

  if (!token) {
    // Jika token tidak ditemukan, kirim respons 401 (Unauthorized)
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  // Verifikasi token
  jwt.verify(token, SECRET_JWT, (err, user) => {
    if (err) {
      // Jika token tidak valid, kirim respons 403 (Forbidden)
      return res.status(403).json({ success: false, error: "Invalid token" });
    }

    // Jika token valid, simpan informasi pengguna di objek req untuk digunakan di rute selanjutnya
    next();
  });
};
