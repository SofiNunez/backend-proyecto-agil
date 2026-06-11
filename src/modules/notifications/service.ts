import { EmailChannel } from './channels/email/email.channel';
import { SMSChannel } from './channels/sms/sms.channel';
import { TrackingService } from '../tracking/service';
import { SendNotificationDto } from './notifications.types';
import { InitTrackingDto } from '../tracking/tracking.types';
import { v4 as uuidv4 } from 'uuid';

export class NotificationsService {
  private static instance: NotificationsService;
  private emailChannel: EmailChannel;
  private smsChannel: SMSChannel;
  private trackingService: TrackingService;

  private constructor() {
    this.emailChannel = new EmailChannel();
    this.smsChannel = new SMSChannel();
    this.trackingService = TrackingService.getInstance();
  }

  static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  async sendNotification(dto: SendNotificationDto) {
    const notificationId = uuidv4();

    if (dto.channel === 'email') {
      const result = await this.emailChannel.send({
        to: dto.recipient.email,
        subject: dto.subject,
        html: dto.body.email,
      });
      const trackingDto: InitTrackingDto = {
        notificationId,
        channel: 'email',
        provider: result.provider,
        providerMessageId: result.messageId,
        recipient: dto.recipient.email,
        attempts: result.attempts,
        success: result.success,
        error: result.error,
      };
      this.trackingService.initTracking(trackingDto);
      return { notificationId, ...result };
    }

    if (dto.channel === 'sms') {
      const result = await this.smsChannel.send({
        to: dto.recipient.telefono,
        message: dto.body.sms,
      });
      const trackingDto: InitTrackingDto = {
        notificationId,
        channel: 'sms',
        provider: result.provider,
        providerMessageId: result.messageId,
        recipient: dto.recipient.telefono,
        attempts: result.attempts,
        success: result.success,
        error: result.error,
      };
      this.trackingService.initTracking(trackingDto);
      return { notificationId, ...result };
    }

    // push -> agregar cuando esté listo
  }
}