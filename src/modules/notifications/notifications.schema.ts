import { z } from 'zod'

export const sendNotificationSchema = z.object({
  channel: z.enum(['email', 'sms']),
  recipient: z.object({
    email: z.string().email(),
    telefono: z.string().min(8)
  }),
  subject: z.string().min(1).max(200),
  body: z.object({
    email: z.string().min(1).max(5000),
    sms: z.string().min(1).max(160)
  })
})