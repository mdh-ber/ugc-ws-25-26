import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';

export const adminRouter = Router();

adminRouter.get('/analytics', requireAuth, (req, res) => {
  // TODO: return aggregated analytics for admin dashboard
  res.json({ ok: true, data: { clicks: 0, conversions: 0 } });
});
