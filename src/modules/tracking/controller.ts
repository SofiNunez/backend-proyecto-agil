import { Router, Request, Response } from 'express';
import { TrackingService } from './service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { AnalyticsService } from '../notifications/analytics.service';

const router = Router();
const trackingService = TrackingService.getInstance();

router.get('/:notificationId', authMiddleware, async (req: Request, res: Response) => {
  const notificationId = Array.isArray(req.params.notificationId)
    ? req.params.notificationId[0]
    : req.params.notificationId;
  const record = await trackingService.getStatus(notificationId);
  if (!record) {
    res.status(404).json({ message: 'Notificación no encontrada' });
    return;
  }
  res.json(record);
});

// Webhook de SendGrid
router.post('/webhooks/sendgrid', async (req: Request, res: Response) => {
  console.log(req.body);
  const body = req.body;
  const events = Array.isArray(body) ? body : [body];
  for (const ev of events) {
    const messageId = Array.isArray(ev.sg_message_id)
      ? ev.sg_message_id[0]
      : ev.sg_message_id?.split('.')[0];
    if (messageId) {
      await trackingService.handleWebhookEvent(messageId, ev.event, ev.reason);
      if (ev.event === 'delivered') {
        const record = await trackingService.getStatusByProviderMessageId(messageId)
        if (record) {
          await AnalyticsService.notificacionEntregada(record.notificationId, record.channel)
        }
      }
    }
  }
  res.sendStatus(200);
});

// Webhook de Vonage GET
router.get('/webhooks/vonage', async (req: Request, res: Response) => {
  console.log('[Webhook] Vonage GET query:', JSON.stringify(req.query))
  const messageId = req.query['messageId'] as string || req.query['message-id'] as string
  const rawStatus = req.query.status as string
  console.log(`[Webhook] Vonage messageId: ${messageId}, status: ${rawStatus}`)
  if (messageId) {
    await trackingService.handleWebhookEvent(messageId, rawStatus)
    if (rawStatus === 'delivered') {
      const record = await trackingService.getStatusByProviderMessageId(messageId)
      if (record) {
        await AnalyticsService.notificacionEntregada(record.notificationId, record.channel)
        console.log(`[Analytics] notificacion_entregada enviado para ${record.notificationId}`)
      }
    }
  }
  res.sendStatus(200)
});

export default router;