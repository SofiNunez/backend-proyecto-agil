import { Router, Request, Response } from 'express';
import { NotificationsService } from './service';
import { sendNotificationSchema } from './notifications.schema';

const router = Router();
const notificationsService = NotificationsService.getInstance();

router.post('/send', async (req: Request, res: Response) => {
  const parsed = sendNotificationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors
    });
    return;
  }

  try {
    const result = await notificationsService.sendNotification(parsed.data);
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
    console.error('[NotificationsController]', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;