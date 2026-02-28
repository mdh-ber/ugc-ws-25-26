const mongoose = require("mongoose");
require("dotenv").config();

const RefereeUu = require("./models/RefereeUu");
const ReferralUu = require("./models/referralUu"); // <-- your file is referralUu.js (lowercase)
const RefereeReferralUu = require("./models/Referee_Referral_UU");

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");

  const refereeDocs = await RefereeUu.find().lean();
  const referralDocs = await ReferralUu.find().lean();

  let upserts = 0;

  // migrate referee uu
for (const d of refereeDocs) {
  await RefereeReferralUu.updateOne(
    { entityType: "referee", entityId: String(d.refereeId), date: d.date },
    {
      $set: {
        entityType: "referee",
        entityId: String(d.refereeId),
        date: d.date,
        uu: d.uu,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      },
    },
    { upsert: true }
  );
  upserts++;
}

// migrate referral uu
for (const d of referralDocs) {
  await RefereeReferralUu.updateOne(
    { entityType: "referral", entityId: String(d.referralId), date: d.date },
    {
      $set: {
        entityType: "referral",
        entityId: String(d.referralId),
        date: d.date,
        uu: d.uu,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      },
    },
    { upsert: true }
  );
  upserts++;
}

  console.log(`✨ Migration completed. Upserts: ${upserts}`);
  console.log(
    "✅ Old collections are untouched. You can delete them later after verifying.",
  );

  process.exit(0);
}

migrate().catch((e) => {
  console.error("❌ Migration error:", e);
  process.exit(1);
});