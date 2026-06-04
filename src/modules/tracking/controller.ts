import { Router, Request, Response } from 'express';
import { TrackingService } from './service';

const router = Router();
const trackingService = TrackingService.getInstance();

// Consultar estado de una notificación
router.get('/:notificationId', (req: Request, res: Response) => {
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

// Webhook de Amazon SES
router.post('/webhooks/ses', (req: Request, res: Response) => {
  const snsMessage = JSON.parse(req.body.Message || '{}');
  const { mail, eventType, bounce } = snsMessage;

  const messageId = Array.isArray(mail?.messageId)
    ? mail.messageId[0]
    : mail?.messageId;

  const reason = bounce?.bouncedRecipients?.[0]?.diagnosticCode;

  trackingService.handleWebhookEvent(messageId, eventType, reason);
  res.sendStatus(200);
});

// Webhook de SendGrid
router.post('/webhooks/sendgrid', (req: Request, res: Response) => {
  const events = req.body as Array<{ sg_message_id: string; event: string; reason?: string }>;

  for (const ev of events) {
    const messageId = Array.isArray(ev.sg_message_id)
      ? ev.sg_message_id[0]
      : ev.sg_message_id?.split('.')[0];

    trackingService.handleWebhookEvent(messageId, ev.event, ev.reason);
  }

  res.sendStatus(200);
});

export default router;