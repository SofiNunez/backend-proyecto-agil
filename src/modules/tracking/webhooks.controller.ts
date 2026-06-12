import { Router, Request, Response } from 'express';
import { TrackingService } from './service';

const router = Router();
const trackingService = TrackingService.getInstance();

// Webhook de Amazon SES
router.post('/ses', (req: Request, res: Response) => {
  try {
    const snsMessage = JSON.parse(req.body.Message || '{}');
    const { mail, eventType, bounce } = snsMessage;
    const messageId = Array.isArray(mail?.messageId)
      ? mail.messageId[0]
      : mail?.messageId;
    const reason = bounce?.bouncedRecipients?.[0]?.diagnosticCode;
    trackingService.handleWebhookEvent(messageId, eventType, reason);
    res.sendStatus(200);
  } catch {
    res.status(400).json({ message: 'Payload inválido' });
  }
});

// Webhook de SendGrid
router.post('/sendgrid', (req: Request, res: Response) => {
  const events = req.body as Array<{ sg_message_id: string; event: string; reason?: string }>;
  for (const ev of events) {
    const messageId = Array.isArray(ev.sg_message_id)
      ? ev.sg_message_id[0]
      : ev.sg_message_id?.split('.')[0];
    trackingService.handleWebhookEvent(messageId, ev.event, ev.reason);
  }
  res.sendStatus(200);
});

// Webhook de Twilio
router.post('/twilio', (req: Request, res: Response) => {
  const messageId = Array.isArray(req.body.SmsSid)
    ? req.body.SmsSid[0]
    : req.body.SmsSid;
  const rawStatus = Array.isArray(req.body.MessageStatus)
    ? req.body.MessageStatus[0]
    : req.body.MessageStatus;
  trackingService.handleWebhookEvent(messageId, rawStatus);
  res.sendStatus(200);
});

// Webhook de Vonage
router.post('/vonage', (req: Request, res: Response) => {
  const messageId = Array.isArray(req.body['message-id'])
    ? req.body['message-id'][0]
    : req.body['message-id'];
  const rawStatus = Array.isArray(req.body.status)
    ? req.body.status[0]
    : req.body.status;
  trackingService.handleWebhookEvent(messageId, rawStatus);
  res.sendStatus(200);
});

export default router;