import { Router, Request, Response } from 'express';
import { NotificationsService } from './service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { notificationRateLimit } from '../../middleware/rate-limit.middleware';

const router = Router();
const notificationsService = NotificationsService.getInstance();

router.post('/send',
  authMiddleware,        // 1. autenticación
  notificationRateLimit, // 2. rate limiting
  async (req: Request, res: Response) => {
    try {
      const result = await notificationsService.sendNotification(req.body);

      if (!result?.success) {
        res.status(502).json({
          message: 'No se pudo enviar la notificación por ningún proveedor',
          provider: result?.provider,
          error: result?.error,
        });
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;