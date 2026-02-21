const Referal = require("../models/Referal");

exports.getReferals = async (req, res) => {
  try {  
   
    const referals = await Referal.Referal.find();  
    res.json(referals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.addReferals = async (req, res) => {
  try {
    const referal = await Referal.Referal.create(req.body);
    res.status(201).json({ message: "Referal added successfully", referal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReferalById = async (req, res) => {
  try {
    const referal = await Referal.Referal.findById(req.params.id);
    if (!referal) {
      return res.status(404).json({ message: "Referal not found" });
    }
    res.json(referal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateReferal = async (req, res) => {
  try {
    const referal = await Referal.Referal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!referal) {
      return res.status(404).json({ message: "Referal not found" });
    }
    res.json({ message: "Referal updated successfully", referal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReferal = async (req, res) => {
  try {
    const referal = await Referal.Referal.findByIdAndDelete(req.params.id);
    if (!referal) {
      return res.status(404).json({ message: "Referal not found" });
    }
    res.json({ message: "Referal deleted successfully", referal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};  
