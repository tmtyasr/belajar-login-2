const express = require("express");
const cors = require("cors");
const session = require('express-session');
// Bcrypt for password hashing
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const logoutRoute = require("./routes/logout");

const authenticateToken = require("./middleware/checkAuthToken");
const { db,authProvider } = require("./utils/firebase")

const dotenv = require("dotenv").config();
const ejs = require("ejs");


const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

app.use(session({
    secret: 'hajksfkahkfhakfhkahsfakfjskafakfj', // Ganti dengan kunci rahasia sesuai kebutuhan
    resave: false,
    saveUninitialized: true,
}));


app.get("/", (req, res) => {
  res.render("login", { errorMessage: null });
});


app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/logout", logoutRoute);



// Fungsi untuk mendekode token dan mengembalikan payload
function decodeToken(token) {
  const decoded = jwt.verify(token, "hajksfkahkfhakfhkahsfakfjskafakfj"); // Ganti 'SECRET_KEY' dengan kunci rahasia sesuai dengan yang digunakan saat membuat token
  return decoded;
}

const messageDev = (msg) => {
  return "${msg}"
}

// Middleware untuk mencabut token atau session jika akun dihapus dari Firebase Database
async function revokeTokenIfAccountDeleted(req, res, next) {
  try {
    if (req.session && req.session.user) {
      const { uid } = req.session.user;
      const userRecord = await authProvider.getUser(uid);

      // Cek apakah akun masih ada di koleksi database Firebase Anda
      const userDoc = await db.collection('users').doc(uid).get();

      // Check apakah akun masih ada di Firebase Authentication
      if (!userRecord) {
        // Akun telah dihapus, maka revoke token atau hapus session
        req.session.destroy();
        // Atau, tambahkan logika untuk mencabut token JWT jika Anda menggunakan JWT
        // contohnya:
        // res.clearCookie('access_token');
        // Dan lakukan proses logout pada sisi klien jika diperlukan
      }
    }
    next();
  } catch (error) {

    res.json({
      message: "Data Akun Tidak Ada"
    })
    next(error);
  }
}

app.get("/coba", async (req, res) => {
  console.log(res.cookie)
  return res.json({
    "hello": "hello"
  })
})

app.get("/tyas", authenticateToken, revokeTokenIfAccountDeleted, async (req, res) => {
  try {
    // Mendekode token untuk mendapatkan payload
    const decodedToken = decodeToken(req.cookies.access_token);

    // Mengakses data pengguna dari payload
    const userData = decodedToken;
    const data =   req.session.user
    console.log(JSON.stringify(userData, null, 2));

    // Render the 'tyas' EJS template with user information
    console.log("Tyas: ", userData); // Informasi pengguna sekarang dapat diakses

    res.render("tyas", { user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log(`Server Running: PORT http://localhost:3000`);
});
