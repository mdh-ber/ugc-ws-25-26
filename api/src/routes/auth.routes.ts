import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  // TODO: validate credentials, issue token
  res.json({ ok: true, token: 'demo-token' });
});
