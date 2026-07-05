import { Request, Response, NextFunction } from 'express';

interface ApiKeyEntry {
  id: number;
  key: string | undefined;
  active: boolean;
}

const apiKeys: ApiKeyEntry[] = [
  { id: 1,  key: process.env.API_KEY_PROYECTO_1,  active: true },
  { id: 3,  key: process.env.API_KEY_PROYECTO_3,  active: true },
  { id: 4,  key: process.env.API_KEY_PROYECTO_4,  active: true },
  { id: 5,  key: process.env.API_KEY_PROYECTO_5,  active: true },
  { id: 7,  key: process.env.API_KEY_PROYECTO_7,  active: true },
  { id: 8,  key: process.env.API_KEY_PROYECTO_8,  active: true },
  { id: 10, key: process.env.API_KEY_PROYECTO_10, active: true },
  { id: 11, key: process.env.API_KEY_PROYECTO_11, active: true },
  { id: 12, key: process.env.API_KEY_TESTING, active: true }
];

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.status(401).json({ message: 'API Key requerida' });
    return;
  }

  if (typeof apiKey !== 'string') {
    res.status(400).json({ message: 'API Key inválida' });
    return;
  }

  const keyValida = apiKeys.find(k => k.key === apiKey && k.active);

  if (!keyValida) {
    res.status(401).json({ message: 'API Key inválida o inactiva' });
    return;
  }

  // Adjunta el id del proyecto al request para usarlo en controllers
  (req as any).projectId = keyValida.id;

  next();
};