import 'dotenv/config';
import express from 'express';
import notificationsRouter from './modules/notifications/controller';
import trackingRouter from './modules/tracking/controller';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1)

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/notifications', authMiddleware, notificationsRouter);
app.use('/tracking', authMiddleware, trackingRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});