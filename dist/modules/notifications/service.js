"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const email_channel_1 = require("./channels/email/email.channel");
const sms_channel_1 = require("./channels/sms/sms.channel");
const service_1 = require("../tracking/service");
const uuid_1 = require("uuid");
class NotificationsService {
    constructor() {
        this.emailChannel = new email_channel_1.EmailChannel();
        this.smsChannel = new sms_channel_1.SMSChannel();
        this.trackingService = service_1.TrackingService.getInstance();
    }
    static getInstance() {
        if (!NotificationsService.instance) {
            NotificationsService.instance = new NotificationsService();
        }
        return NotificationsService.instance;
    }
    async sendNotification(dto) {
        const notificationId = (0, uuid_1.v4)();
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
exports.NotificationsService = NotificationsService;
