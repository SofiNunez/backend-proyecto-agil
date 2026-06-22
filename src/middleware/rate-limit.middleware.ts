import rateLimit from 'express-rate-limit';

export const notificationRateLimit = rateLimit({
  windowMs: 60 * 1000, 
  max: 20,             
  message: { message: 'Demasiadas solicitudes, intenta en un momento' },
  standardHeaders: true,
  legacyHeaders: false,
});