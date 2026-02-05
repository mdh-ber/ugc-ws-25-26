import { Router } from 'express';

export const trackingRouter = Router();

trackingRouter.post('/click', (req, res) => {
  // TODO: store click event for a link slug/id
  res.json({ ok: true });
});

trackingRouter.post('/conversion', (req, res) => {
  // TODO: store conversion (signup/enrollment)
  res.json({ ok: true });
});
