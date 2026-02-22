<<<<<<< HEAD
const ReferralVisit = require("../models/referralVisit");

exports.trackVisit = async (req, res) => {
  try {
    const { code } = req.params;

    const berlinTime = new Date().toLocaleString("sv-SE", {
      timeZone: "Europe/Berlin"
    });

    const visit = await ReferralVisit.create({
      userId: req.user?.id || "guest-user",
      creatorId: "creator1", // later fetch dynamically
      referralCode: code,
      hubspotTrackingId: req.headers["x-hubspot-id"] || "dummy-hs-id",
      capturedAt: berlinTime
    });

    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUniqueAudience = async (req, res) => {
  try {
    const data = await ReferralVisit.aggregate([
      {
        $group: {
          _id: {
            creatorId: "$creatorId",
            hubspotTrackingId: "$hubspotTrackingId"
          }
        }
      },
      {
        $group: {
          _id: "$_id.creatorId",
          uniqueUsers: { $sum: 1 }
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
=======
const Referal = require("../models/Referral");

exports.getReferrals = async (req, res) => {
  try {  
   
    const referrals = await Referal.Referral.find();  
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.addReferrals = async (req, res) => {
  try {
    const referral = await Referal.Referral.create(req.body);
    res.status(201).json({ message: "Referral added successfully", referral });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReferralById = async (req, res) => {
  try {
    const referral = await Referal.Referral.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }
    res.json(referral);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateReferral = async (req, res) => {
  try {
    const referral = await Referal.Referral.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }
    res.json({ message: "Referral updated successfully", referral });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReferral = async (req, res) => {
  try {
    const referral = await Referal.Referral.findByIdAndDelete(req.params.id);
    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }
    res.json({ message: "Referral deleted successfully", referral });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};  
>>>>>>> a318b33d15b73535c77bbcded28051c39659d1de
