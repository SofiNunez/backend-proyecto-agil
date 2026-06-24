import { EmailChannel } from './channels/email/email.channel';
import { SMSChannel } from './channels/sms/sms.channel';
import { PushChannel } from './channels/push/push.channel';
import { TrackingService } from '../tracking/service';
import { SendNotificationDto } from './notifications.types';
import { AnalyticsService } from './analytics.service';
import { v4 as uuidv4 } from 'uuid';

export class NotificationsService {
  private static instance: NotificationsService;
  private emailChannel: EmailChannel;
  private smsChannel: SMSChannel;
  private trackingService: TrackingService;
  private pushChannel: PushChannel;

  private constructor() {
    this.emailChannel = new EmailChannel();
    this.smsChannel = new SMSChannel();
    this.pushChannel = new PushChannel();
    this.trackingService = TrackingService.getInstance();
  }

  static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  async sendNotification(dto: SendNotificationDto & { notificationId?: string }) {
    const notificationId = dto.notificationId ?? uuidv4();

    if (dto.channel === 'email') {
      const resultado = await this.emailChannel.send({
        to: dto.recipient.email!,
        subject: dto.subject ?? '',
        html: dto.body.email!,
      });

      if (resultado.success) {
        this.trackingService.initTracking({
          notificationId,
          channel: 'email',
          provider: resultado.provider,
          providerMessageId: resultado.messageId,
          recipient: dto.recipient.email!,
          attempts: resultado.attempts,
          success: true,
          error: resultado.error,
        });
        // Avisa al Grupo 9
        AnalyticsService.notificacionEnviada(notificationId, 'email', resultado.attempts);
        return { notificationId, fallback_activado: false, ...resultado };
      }

      console.warn('[NotificationsService] Email falló, activando fallback a SMS');
      // Avisa al Grupo 9 que se activó fallback
      AnalyticsService.fallbackActivado(notificationId, 'sms');

      const resultadoSMS = await this.smsChannel.send({
        to: dto.recipient.telefono!,
        message: dto.body.sms!,
      });

      this.trackingService.initTracking({
        notificationId,
        channel: 'sms',
        provider: resultadoSMS.provider,
        providerMessageId: resultadoSMS.messageId,
        recipient: dto.recipient.telefono!,
        attempts: resultado.attempts + resultadoSMS.attempts,
        success: resultadoSMS.success,
        error: resultadoSMS.error,
      });

      if (resultadoSMS.success) {
        AnalyticsService.notificacionEnviada(notificationId, 'sms', resultado.attempts + resultadoSMS.attempts);
      } else {
        AnalyticsService.notificacionFallida(notificationId, 'sms', resultado.attempts + resultadoSMS.attempts);
      }

      return { notificationId, fallback_activado: true, ...resultadoSMS };
    }

    if (dto.channel === 'sms') {
      const resultado = await this.smsChannel.send({
        to: dto.recipient.telefono!,
        message: dto.body.sms!,
      });

      this.trackingService.initTracking({
        notificationId,
        channel: 'sms',
        provider: resultado.provider,
        providerMessageId: resultado.messageId,
        recipient: dto.recipient.telefono!,
        attempts: resultado.attempts,
        success: resultado.success,
        error: resultado.error,
      });

      if (resultado.success) {
        AnalyticsService.notificacionEnviada(notificationId, 'sms', resultado.attempts);
      } else {
        AnalyticsService.notificacionFallida(notificationId, 'sms', resultado.attempts);
      }

      return { notificationId, fallback_activado: false, ...resultado };
    }

    if (dto.channel === 'push') {
      const resultado = await this.pushChannel.send({
        to: dto.recipient.deviceToken!,
        title: dto.body.push?.title ?? dto.subject ?? '',
        body: dto.body.push?.body ?? '',
      });

      if (resultado.success) {
        this.trackingService.initTracking({
          notificationId,
          channel: 'push',
          provider: resultado.provider,
          providerMessageId: resultado.messageId,
          recipient: dto.recipient.deviceToken!,
          attempts: resultado.attempts,
          success: true,
          error: resultado.error,
        });
        AnalyticsService.notificacionEnviada(notificationId, 'push', resultado.attempts);
        return { notificationId, fallback_activado: false, ...resultado };
      }

      console.warn('[NotificationsService] Push falló, activando fallback a email');
      AnalyticsService.fallbackActivado(notificationId, 'email');

      const resultadoEmail = await this.emailChannel.send({
        to: dto.recipient.email!,
        subject: dto.subject ?? '',
        html: dto.body.email!,
      });

      this.trackingService.initTracking({
        notificationId,
        channel: 'email',
        provider: resultadoEmail.provider,
        providerMessageId: resultadoEmail.messageId,
        recipient: dto.recipient.email!,
        attempts: resultado.attempts + resultadoEmail.attempts,
        success: resultadoEmail.success,
        error: resultadoEmail.error,
      });

      if (resultadoEmail.success) {
        AnalyticsService.notificacionEnviada(notificationId, 'email', resultado.attempts + resultadoEmail.attempts);
      } else {
        AnalyticsService.notificacionFallida(notificationId, 'email', resultado.attempts + resultadoEmail.attempts);
      }

      return { notificationId, fallback_activado: true, ...resultadoEmail };
    }

    throw new Error(`Canal de notificación desconocido: ${dto.channel}`);
  }
}