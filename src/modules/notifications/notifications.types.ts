export interface SendNotificationDto {
  channel: 'email' | 'sms' | 'push';
  recipient: string;
  subject: string;
  body: string;
}