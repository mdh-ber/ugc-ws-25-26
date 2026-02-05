import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './routes/auth.routes';
import { trackingRouter } from './routes/tracking.routes';
import { adminRouter } from './routes/admin.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/tracking', trackingRouter);
app.use('/admin', adminRouter);

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});
