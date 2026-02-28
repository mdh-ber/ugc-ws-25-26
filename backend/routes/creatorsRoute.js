const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Creator = require('../models/Creator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

/** POST /api/creators — Register a new creator */
router.post(
  '/',
  [
    body('username').isString().isLength({ min: 3 }).trim().toLowerCase(),
    body('displayName').isString().isLength({ min: 1 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('avatarUrl').optional().isURL(),
  ],
  validate,
  async (req, res) => {
    try {
      const { username, displayName, email, avatarUrl } = req.body;

      const existing = await Creator.findOne({ $or: [{ username }, { email }] });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Username or email already taken' });
      }

      const creator = await Creator.create({ username, displayName, email, avatarUrl });
      return res.status(201).json({ success: true, data: creator });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/** GET /api/creators — List all creators */
router.get('/', async (req, res) => {
  try {
    const creators = await Creator.find({ isActive: true })
      .sort({ 'score.total': -1 })
      .select('-email -__v');
    return res.json({ success: true, data: creators });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/creators/:id — Get creator by ID */
router.get('/:id', [param('id').isMongoId()], validate, async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id).select('-email -__v');
    if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });
    return res.json({ success: true, data: creator });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PATCH /api/creators/:id — Update creator profile */
router.patch(
  '/:id',
  [
    param('id').isMongoId(),
    body('displayName').optional().isString().trim(),
    body('avatarUrl').optional().isURL(),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  async (req, res) => {
    try {
      const allowed = ['displayName', 'avatarUrl', 'isActive'];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      const creator = await Creator.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      ).select('-email -__v');

      if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });
      return res.json({ success: true, data: creator });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;