const mongoose = require("mongoose");
require("dotenv").config();

const RefereeUu = require("./models/RefereeUu");
const ReferralUu = require("./models/ReferralUu");
const { Referral } = require("./models/Referral");

function toYYYYMMDD(d) {
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");

  await RefereeUu.deleteMany({});
  await ReferralUu.deleteMany({});
  await Referral.deleteMany({});

  const today = new Date();
  const d1 = new Date(today); d1.setDate(today.getDate() - 2);
  const d2 = new Date(today); d2.setDate(today.getDate() - 1);

  const day1 = toYYYYMMDD(d1);
  const day2 = toYYYYMMDD(d2);

  // Seed RefereeUu
  await RefereeUu.insertMany([
    { refereeId: "ref1", date: day1, uu: 2 },
    { refereeId: "ref1", date: day2, uu: 1 },
    { refereeId: "ref2", date: day2, uu: 1 },
  ]);

  // Create real Referral docs (so we can show names via lookup)
  const refA = await Referral.create({
    firstName: "John",
    surName: "Doe",
    intake: "Winter",
    year: "2026",
    enrolledCourse: "Computer Science",
    referredBy: "ref1",
    referralDate: new Date(),
    enrollmentStatus: "Pending",
    rewardStatus: "Pending",
  });

  const refB = await Referral.create({
    firstName: "Jane",
    surName: "Smith",
    intake: "Summer",
    year: "2026",
    enrolledCourse: "Business",
    referredBy: "ref2",
    referralDate: new Date(),
    enrollmentStatus: "Enrolled",
    rewardStatus: "Approved",
  });

  // Seed ReferralUu using Referral._id as referralId
  await ReferralUu.insertMany([
    { referralId: String(refA._id), date: day1, uu: 1 },
    { referralId: String(refA._id), date: day2, uu: 2 },
    { referralId: String(refB._id), date: day2, uu: 1 },
  ]);

  console.log("✨ Seeded RefereeUu + ReferralUu + Referral");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});