/**
 * One-time script to hash all plain-text passwords in the User collection.
 * Run once: node Backend/scripts/hashPasswords.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/student-management";

async function migratePasswords() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).toArray();

    console.log(`Found ${users.length} user(s). Checking passwords...`);
    let updated = 0;

    for (const user of users) {
      // If password does NOT start with a bcrypt hash prefix, hash it
      if (!user.password.startsWith("$2b$") && !user.password.startsWith("$2a$")) {
        console.log(`Hashing password for: ${user.email}`);
        const hashed = await bcrypt.hash(user.password, 10);
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { password: hashed } }
        );
        updated++;
      } else {
        console.log(`Already hashed: ${user.email} — skipping`);
      }
    }

    console.log(`\n✅ Done! ${updated} password(s) hashed.`);
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

migratePasswords();
