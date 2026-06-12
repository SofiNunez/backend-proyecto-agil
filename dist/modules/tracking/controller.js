"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_1 = require("./service");
const router = (0, express_1.Router)();
const trackingService = service_1.TrackingService.getInstance();
// Consultar estado de una notificación
router.get('/:notificationId', (req, res) => {
    const notificationId = Array.isArray(req.params.notificationId)
        ? req.params.notificationId[0]
        : req.params.notificationId;
    const record = trackingService.getStatus(notificationId);
    if (!record) {
        res.status(404).json({ message: 'Notificación no encontrada' });
        return;
    }
    res.json(record);
});
// Webhook de Amazon SES
router.post('/webhooks/ses', (req, res) => {
    const snsMessage = JSON.parse(req.body.Message || '{}');
    const { mail, eventType, bounce } = snsMessage;
    const messageId = Array.isArray(mail?.messageId)
        ? mail.messageId[0]
        : mail?.messageId;
    const reason = bounce?.bouncedRecipients?.[0]?.diagnosticCode;
    trackingService.handleWebhookEvent(messageId, eventType, reason);
    res.sendStatus(200);
});
// Webhook de SendGrid
router.post('/webhooks/sendgrid', (req, res) => {
    const events = req.body;
    for (const ev of events) {
        const messageId = Array.isArray(ev.sg_message_id)
            ? ev.sg_message_id[0]
            : ev.sg_message_id?.split('.')[0];
        trackingService.handleWebhookEvent(messageId, ev.event, ev.reason);
    }
    res.sendStatus(200);
});
// Webhook de Twilio
router.post('/webhooks/twilio', (req, res) => {
    const messageId = Array.isArray(req.body.SmsSid)
        ? req.body.SmsSid[0]
        : req.body.SmsSid;
    const rawStatus = Array.isArray(req.body.MessageStatus)
        ? req.body.MessageStatus[0]
        : req.body.MessageStatus;
    trackingService.handleWebhookEvent(messageId, rawStatus);
    res.sendStatus(200);
});
// Webhook de Vonage
router.post('/webhooks/vonage', (req, res) => {
    const messageId = Array.isArray(req.body['message-id'])
        ? req.body['message-id'][0]
        : req.body['message-id'];
    const rawStatus = Array.isArray(req.body.status)
        ? req.body.status[0]
        : req.body.status;
    trackingService.handleWebhookEvent(messageId, rawStatus);
    res.sendStatus(200);
});
exports.default = router;
