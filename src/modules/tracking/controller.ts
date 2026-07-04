import { Router, Request, Response } from 'express';
import { TrackingService } from './service';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const trackingService = TrackingService.getInstance();

router.get('/:notificationId', authMiddleware, (req: Request, res: Response) => {
  const notificationId = Array.isArray(req.params.notificationId)
    ? req.params.notificationId[0]
    : req.params.notificationId;
  const record = trackingService.getStatus(notificationId);
  if (!record) {
    res.status(404).json({ message: 'Notificación no encontrada' });
    return;
  }
  res.json(record);
});

// Webhook de SendGrid
router.post('/webhooks/sendgrid', (req: Request, res: Response) => {
  console.log(req.body);
  const body = req.body;
  const events = Array.isArray(body) ? body : [body];
  for (const ev of events) {
    const messageId = Array.isArray(ev.sg_message_id)
      ? ev.sg_message_id[0]
      : ev.sg_message_id?.split('.')[0];
    if (messageId) {
      trackingService.handleWebhookEvent(messageId, ev.event, ev.reason);
    }
  }
  res.sendStatus(200);
});

// Webhook de Vonage
router.post('/webhooks/vonage', (req: Request, res: Response) => {
  console.log('[Webhook] Vonage body:', JSON.stringify(req.body))
  console.log('[Webhook] Vonage query:', JSON.stringify(req.query))
  const messageId = req.query['message-id'] as string || req.query.messageId as string || req.body['message-id'] || req.body.messageId
  const rawStatus = req.query.status as string || req.body.status
  console.log(`[Webhook] Vonage messageId: ${messageId}, status: ${rawStatus}`)
  if (messageId) {
    trackingService.handleWebhookEvent(messageId, rawStatus)
  }
  res.sendStatus(200)
});

export default router;