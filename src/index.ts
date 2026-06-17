import 'dotenv/config';
import express from 'express';
import notificationsRouter from './modules/notifications/controller';
import trackingRouter from './modules/tracking/controller';
import { authMiddleware } from './middleware/auth.middleware';
import { SMSChannel } from './modules/notifications/channels/sms/sms.channel';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/notifications', authMiddleware, notificationsRouter);
app.use('/tracking', trackingRouter);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});