const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const createTokenJWT = require("../utils/createJwt");
const { db } = require("../utils/firebase");

router.get("/", async (req, res) => {
  res.render("login");
});

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // Ambil data pengguna dari Firebase Firestore
    const userSnapshot = await db.collection("users").where("email", "==", email).get();

    if (userSnapshot.empty) {
      // Pengguna tidak ditemukan
      return res.status(401).json({ success: false, error: "User not registered" });
    }

    // Ambil data pengguna dari hasil query
    const userData = userSnapshot.docs[0].data();
    const uid = userSnapshot.docs[0].id; // Ambil UID pengguna dari dokumen
    // Bandingkan password yang diberikan dengan password di database
    const isPasswordValid = await bcrypt.compare(password, userData.password || "");

    if (isPasswordValid) {
      // Buat salinan objek userData tanpa menyertakan properti password
      const userDataWithoutPassword = { ...userData };
      delete userDataWithoutPassword.password;

      userDataWithoutPassword.uid = uid;
      // Password valid, buat token JWT
      const token = createTokenJWT(userDataWithoutPassword);

      // Set token di header respons
      res.header("authorization", `Bearer ${token}`);

      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 1000
      });

      req.session.user = userDataWithoutPassword;

      // Redirect to "/tyas"
      return res.redirect("/tyas");
    } else {
      // Password tidak valid
      const errorMessage = "Invalid email or password";
      return res.render("login", { errorMessage });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
