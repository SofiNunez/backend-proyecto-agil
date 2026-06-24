export interface SendNotificationDto {
  channel: 'email' | 'sms' | 'push';
  recipient: {
    email?: string;
    telefono?: string;
    deviceToken?: string;
  };
  subject?: string;
  body: {
    email?: string;
    sms?: string;
    push?: {
      title: string;
      body: string;
    };
  };
}