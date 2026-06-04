import { EmailChannel } from './channels/email/email.channel';
import { TrackingService } from '../tracking/service';
import { SendNotificationDto } from './notifications.types';
import { InitTrackingDto } from '../tracking/tracking.types';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos de notificación

export class NotificationsService {
  private static instance: NotificationsService;

  private emailChannel: EmailChannel;
  private trackingService: TrackingService;

  private constructor() {
    this.emailChannel = new EmailChannel();
    this.trackingService = TrackingService.getInstance();
  }

  static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  async sendNotification(dto: SendNotificationDto) {
    if (dto.channel === 'email') {
      const result = await this.emailChannel.send({
        to: dto.recipient,
        subject: dto.subject,
        html: dto.body,
      });

      const trackingDto: InitTrackingDto = {
        notificationId: dto.id ?? uuidv4(),
        channel: 'email',
        provider: result.provider,
        providerMessageId: result.messageId,
        recipient: dto.recipient,
        attempts: result.attempts,
        success: result.success,
        error: result.error,
      };

      this.trackingService.initTracking(trackingDto);

      return result;
    }
    // ... otros canales (SMS, push)
  }
}