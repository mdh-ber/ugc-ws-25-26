const mongoose = require("mongoose");
require("dotenv").config();

const RefereeReferralUu = require("./models/Referee_Referral_UU");
const { Referral } = require("./models/Referral");

function toYYYYMMDD(d) {
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");

  // clear unified UU docs
  await RefereeReferralUu.deleteMany({});

  // OPTIONAL: keep your referral list data, so don't delete referrals
  // await Referral.deleteMany({});

  const today = new Date();
  const d1 = new Date(today);
  d1.setDate(today.getDate() - 2);
  const d2 = new Date(today);
  d2.setDate(today.getDate() - 1);

  const day1 = toYYYYMMDD(d1);
  const day2 = toYYYYMMDD(d2);

  // ✅ referralCodeId is ObjectId in your schema
  const dummyReferralCodeIdA = new mongoose.Types.ObjectId();
  const dummyReferralCodeIdB = new mongoose.Types.ObjectId();

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

    // required fields in your schema
    phoneNumber: "9999999999",
    email: "john.doe@example.com",
    referralCodeId: dummyReferralCodeIdA,
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

    // required fields
    phoneNumber: "8888888888",
    email: "jane.smith@example.com",
    referralCodeId: dummyReferralCodeIdB,
  });

  await RefereeReferralUu.insertMany([
    // Referee UU
    { entityType: "referee", entityId: "ref1", date: day1, uu: 2 },
    { entityType: "referee", entityId: "ref1", date: day2, uu: 1 },
    { entityType: "referee", entityId: "ref2", date: day2, uu: 1 },

    // Referral UU (store Referral._id as entityId)
    { entityType: "referral", entityId: String(refA._id), date: day1, uu: 1 },
    { entityType: "referral", entityId: String(refA._id), date: day2, uu: 2 },
    { entityType: "referral", entityId: String(refB._id), date: day2, uu: 1 },
  ]);

  console.log("✨ Seeded RefereeReferralUu + Referral profiles successfully");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});