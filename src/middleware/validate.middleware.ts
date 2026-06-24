import { Request, Response, NextFunction } from 'express';

export function validateSendNotification(req: Request, res: Response, next: NextFunction) {
  const { channel, recipient, body } = req.body;

  if (!channel) {
    res.status(400).json({ message: 'El campo channel es requerido' });
    return;
  }

  if (channel === 'email') {
    if (!recipient?.email) {
      res.status(400).json({ message: 'recipient.email es requerido para canal email' });
      return;
    }
    if (!body?.email) {
      res.status(400).json({ message: 'body.email es requerido para canal email' });
      return;
    }
  }

  if (channel === 'sms') {
    if (!recipient?.telefono) {
      res.status(400).json({ message: 'recipient.telefono es requerido para canal sms' });
      return;
    }
    if (!body?.sms) {
      res.status(400).json({ message: 'body.sms es requerido para canal sms' });
      return;
    }
  }

  if (channel === 'push') {
    if (!recipient?.deviceToken) {
      res.status(400).json({ message: 'recipient.deviceToken es requerido para canal push' });
      return;
    }
    if (!body?.push?.title || !body?.push?.body) {
      res.status(400).json({ message: 'body.push.title y body.push.body son requeridos para canal push' });
      return;
    }
  }

  next();
}