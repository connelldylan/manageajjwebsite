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
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, "Jiujitsu.json"), "utf8"));

// Convert a date string to Firestore Timestamp
function toTimestamp(dateStr) {
  if (!dateStr) return null;
  const jsDate = new Date(dateStr.replace(" ", "T") + (dateStr.includes("T") ? "" : "Z"));
  return Timestamp.fromDate(jsDate);
}

// Upload data to "Members" collection
async function importMembers() {
  for (const user of rawData) {
    try {
      const formattedCheckIns = (user.CheckIns || []).map(entry => ({
        date: toTimestamp(entry.date)
      }));

      const userData = {
        Name: user.Name,
        Email: user.Email,
        PhoneNumber: user.PhoneNumber,
        BeltLevel: user.BeltLevel,
        Subscription: user.Subscription,
        CheckIns: formattedCheckIns,
        Address: user.Address,
        BirthDate: toTimestamp(user.BirthDate),
        JoinDate: toTimestamp(user.JoinDate),
        Password: user.Password
      };

      await db.collection("Members").add(userData);
      console.log(`✅ Added user: ${user.Name}`);
    } catch (err) {
      console.error(`❌ Error adding user ${user.Name}:`, err.message);
    }
  }
}

importMembers();
