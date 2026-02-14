const mongoose = require("mongoose");
require("dotenv").config();

const RefereeUu = require("./models/RefereeUu");
const ReferralUu = require("./models/ReferralUu");

function toYYYYMMDD(d) {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");

  // clear old data
  await RefereeUu.deleteMany({});
  await ReferralUu.deleteMany({});

  const today = new Date();
  const d1 = new Date(today); d1.setDate(today.getDate() - 2);
  const d2 = new Date(today); d2.setDate(today.getDate() - 1);

  const day1 = toYYYYMMDD(d1);
  const day2 = toYYYYMMDD(d2);

  // Seed aggregated UU per day (this matches schema: refereeId + date + uu)
  await RefereeUu.insertMany([
    { refereeId: "ref1", date: day1, uu: 2 },
    { refereeId: "ref1", date: day2, uu: 1 },
    { refereeId: "ref2", date: day2, uu: 1 },
  ]);

  await ReferralUu.insertMany([
    { referralId: "r1", date: day1, uu: 1 },
    { referralId: "r1", date: day2, uu: 1 },
  ]);

  console.log("✨ Seeded RefereeUu + ReferralUu (aggregated per day)");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});