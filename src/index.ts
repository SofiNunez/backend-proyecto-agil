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

const trackingService = TrackingService.getInstance();

// Webhooks públicos sin auth
app.post('/webhooks/vonage', express.urlencoded({ extended: true }), express.json(), (req, res) => {
  console.log('[Webhook] Vonage body:', JSON.stringify(req.body))
  console.log('[Webhook] Vonage query:', JSON.stringify(req.query))
  const messageId = req.body['message-id'] || req.body.messageId || req.query['message-id'] as string || req.query.messageId as string
  const rawStatus = req.body.status || req.query.status as string
  console.log(`[Webhook] Vonage messageId: ${messageId}, status: ${rawStatus}`)
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