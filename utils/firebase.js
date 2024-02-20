const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert("./service.json"),
});


// Firestore
const db = admin.firestore();
const authProvider = admin.auth();


module.exports = { admin, db, authProvider };