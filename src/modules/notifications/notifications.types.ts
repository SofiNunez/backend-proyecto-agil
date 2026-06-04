export interface SendNotificationDto {
  id: string;
  channel: 'email' | 'sms' | 'push';
  recipient: string;
  subject: string;
  body: string;
}