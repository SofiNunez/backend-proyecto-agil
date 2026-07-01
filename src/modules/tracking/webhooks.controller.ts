import { Router, Request, Response } from 'express';
import { TrackingService } from './service';

const router = Router();
const trackingService = TrackingService.getInstance();

// Webhook de SendGrid
router.post('/sendgrid', (req: Request, res: Response) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    for (const ev of events) {
      const messageId = ev.sg_message_id?.split('.')[0];
      trackingService.handleWebhookEvent(messageId, ev.event, ev.reason);
      console.log(`[Webhook] SendGrid evento: ${ev.event}, messageId: ${messageId}`);
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('[Webhook] Error procesando SendGrid:', error);
    res.sendStatus(400);
  }
});

// Webhook de Vonage
router.post('/vonage', (req: Request, res: Response) => {
  try {
    const messageId = req.body['message-id'] || req.body.messageId;
    const rawStatus = req.body.status;
    console.log(`[Webhook] Vonage evento: ${rawStatus}, messageId: ${messageId}`);
    trackingService.handleWebhookEvent(messageId, rawStatus);
    res.sendStatus(200);
  } catch (error) {
    console.error('[Webhook] Error procesando Vonage:', error);
    res.sendStatus(400);
  }
});

export default router;