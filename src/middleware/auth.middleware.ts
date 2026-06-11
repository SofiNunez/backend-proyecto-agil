import { Request, Response, NextFunction } from 'express'
import { apiKeys } from '../../config.json'

const requestCounts = new Map<string, { count: number, resetAt: number }>()

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    res.status(401).json({ message: 'API Key requerida' })
    return
  }

  const keyValida = apiKeys.find(
    (k: any) => k.key === apiKey && k.active === true
  )

  if (!keyValida) {
    res.status(401).json({ message: 'API Key inválida o inactiva' })
    return
  }

  // Rate limiting
  const ahora = Date.now()
  const ventana = requestCounts.get(keyValida.key)

  if (!ventana || ahora > ventana.resetAt) {
    requestCounts.set(keyValida.key, {
      count: 1,
      resetAt: ahora + 60 * 1000
    })
  } else {
    ventana.count++
    if (ventana.count > keyValida.rate_limit_per_minute) {
      res.status(429).json({ 
        message: `Límite de ${keyValida.rate_limit_per_minute} solicitudes por minuto excedido` 
      })
      return
    }
  }

  next()
}