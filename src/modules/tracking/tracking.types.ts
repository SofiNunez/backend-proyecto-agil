export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';
export type NotificationChannel = 'email' | 'sms' | 'push';

export interface TrackingRecord {
  id: string;
  notificationId: string;      // ID de tu sistema
  channel: NotificationChannel;
  provider: string;            // 'amazon-ses' | 'sendgrid'
  providerMessageId?: string;  // ID que te da el proveedor (para cruzar con webhook)
  status: NotificationStatus;
  recipient: string;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  statusHistory: StatusEvent[];
}

export interface StatusEvent {
  status: NotificationStatus;
  timestamp: Date;
  reason?: string;  // Razón de rechazo o fallo, si aplica
}

export interface InitTrackingDto {
  notificationId: string;
  channel: NotificationChannel;
  provider: string;
  providerMessageId?: string;
  recipient: string;
  attempts: number;
  success: boolean;
  error?: string;
}
