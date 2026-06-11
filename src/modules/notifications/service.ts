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
      const resultado = await this.emailChannel.send({
        to: dto.recipient.email,
        subject: dto.subject,
        html: dto.body.email,
      });

      // Si email fue exitoso
      if (resultado.success) {
        this.trackingService.initTracking({
          notificationId,
          channel: 'email',
          provider: resultado.provider,
          providerMessageId: resultado.messageId,
          recipient: dto.recipient.email,
          attempts: resultado.attempts,
          success: true,
          error: resultado.error,
        });
        return { notificationId, fallback_activado: false, ...resultado };
      }

      // Email falló, activar fallback a SMS
      console.warn('[NotificationsService] Email falló, activando fallback a SMS');
      const resultadoSMS = await this.smsChannel.send({
        to: dto.recipient.telefono,
        message: dto.body.sms,
      });

      this.trackingService.initTracking({
        notificationId,
        channel: 'sms',
        provider: resultadoSMS.provider,
        providerMessageId: resultadoSMS.messageId,
        recipient: dto.recipient.telefono,
        attempts: resultado.attempts + resultadoSMS.attempts,
        success: resultadoSMS.success,
        error: resultadoSMS.error,
      });

      return { notificationId, fallback_activado: true, ...resultadoSMS };
    }

    if (dto.channel === 'sms') {
      const resultado = await this.smsChannel.send({
        to: dto.recipient.telefono,
        message: dto.body.sms,
      });

      this.trackingService.initTracking({
        notificationId,
        channel: 'sms',
        provider: resultado.provider,
        providerMessageId: resultado.messageId,
        recipient: dto.recipient.telefono,
        attempts: resultado.attempts,
        success: resultado.success,
        error: resultado.error,
      });

      return { notificationId, fallback_activado: false, ...resultado };
    }

    // push -> agregar cuando esté listo
  }
}