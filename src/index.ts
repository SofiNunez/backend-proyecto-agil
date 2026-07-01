import 'dotenv/config';
import express from 'express';
import notificationsRouter from './modules/notifications/controller';
import trackingRouter from './modules/tracking/controller';
import { authMiddleware } from './middleware/auth.middleware';
import { TrackingService } from './modules/tracking/service';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1)
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Webhooks públicos sin auth
const trackingService = TrackingService.getInstance();

app.post('/webhooks/vonage', (req, res) => {
  console.log('[Webhook] Vonage body:', JSON.stringify(req.body))
  const messageId = req.body['message-id'] || req.body.messageId
  const rawStatus = req.body.status
  trackingService.handleWebhookEvent(messageId, rawStatus)
  res.sendStatus(200)
})

app.post('/webhooks/sendgrid', (req, res) => {
  const events = Array.isArray(req.body) ? req.body : [req.body]
  for (const ev of events) {
    const messageId = ev.sg_message_id?.split('.')[0]
    trackingService.handleWebhookEvent(messageId, ev.event, ev.reason)
  }
  res.sendStatus(200)
})

// Rutas protegidas
app.use('/notifications', authMiddleware, notificationsRouter);
app.use('/tracking', authMiddleware, trackingRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});