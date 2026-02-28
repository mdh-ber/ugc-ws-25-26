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
