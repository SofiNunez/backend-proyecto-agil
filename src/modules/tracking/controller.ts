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

export default router;