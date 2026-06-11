export interface SendNotificationDto {
  channel: 'email' | 'sms' | 'push'
  recipient: {
    email: string
    telefono: string
  }
  subject: string
  body: {
    email: string
    sms: string
  }
}