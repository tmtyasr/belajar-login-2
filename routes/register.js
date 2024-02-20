const express = require("express");
const bcrypt = require("bcrypt");
const { authProvider, db } = require("../utils/firebase");
const router = express.Router();

const saltRounds = 10;

router.get("/", async (req, res) => {
  try {
    res.status(200).render("register");
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Internal Server Error", error });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in Firebase Authentication
    const userRecord = await authProvider.createUser({
      email,
      password: hashedPassword,
      displayName: name,
    });

    // Extract relevant user data
    const userData = {
      email: userRecord.email,
      password: hashedPassword,
      name: userRecord.displayName,
      // Add any other relevant user data here
    };

    // Store user data in Firestore
    await db.collection("users").doc(userRecord.uid).set(userData);

    // Redirect to login page
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
