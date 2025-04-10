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

function toTimestamp(dateStr) {
  if (!dateStr) throw new Error("Date string is empty or undefined");

  // Try to detect and convert non-ISO format like "YYYY-MM-DD HH:MM:SS"
  let jsDate;
  if (dateStr.includes("T")) {
    jsDate = new Date(dateStr); // ISO is safe
  } else {
    jsDate = new Date(dateStr.replace(" ", "T") + "Z"); // convert to ISO manually
  }

  if (isNaN(jsDate.getTime())) {
    console.error("Invalid date string:", dateStr);
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return Timestamp.fromDate(jsDate);
}




// Upload data to "Members" collection
async function importMembers() {
  for (const user of rawData) {
    const formattedCheckIns = user.CheckIns.map(entry => ({
      date: toTimestamp(entry.date)
    }));
    

    const userData = {
      ...user,
      CheckIns: formattedCheckIns,
      BirthDate: toTimestamp(user.BirthDate),
      JoinDate: toTimestamp(user.JoinDate)
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
