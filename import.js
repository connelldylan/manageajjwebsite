const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Firebase service account setup
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

// Load JSON data
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, "MOCK_DATA.json"), "utf8"));

// Convert date strings to Firestore Timestamps
function toTimestamp(dateStr) {
  const jsDate = new Date(dateStr.replace(" ", "T") + "Z");
  return Timestamp.fromDate(jsDate);
}

// Upload data to "Members" collection
async function importMembers() {
  for (const user of rawData) {
    const formattedCheckIns = user.CheckIns.map(entry => toTimestamp(entry.date));

    const userData = {
      ...user,
      CheckIns: formattedCheckIns
    };

    try {
      await db.collection("Members").add(userData);
      console.log(`✅ Added user: ${user.Name}`);
    } catch (err) {
      console.error(`❌ Error adding user ${user.Name}:`, err.message);
    }
  }
}

importMembers();
