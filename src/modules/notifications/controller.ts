import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateSendNotification } from '../../middleware/validate.middleware';
import { notificationRateLimit } from '../../middleware/rate-limit.middleware';
import { notificationQueue } from '../../queue/notification.queue';

const router = Router();

router.post('/send',
  authMiddleware,
  notificationRateLimit,
  validateSendNotification,
  async (req: Request, res: Response) => {
    try {
      const result = await notificationQueue.add(req.body);

      if (!result.queued) {
        res.status(429).json({ message: 'Sistema sobrecargado, intenta más tarde' });
        return;
      }

      res.status(202).json({
        jobId: result.id,
        notificationId: result.notificationId,
        message: 'Notificación en cola',
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get('/queue/status', authMiddleware, (req: Request, res: Response) => {
  res.json(notificationQueue.status());
});

export default router;