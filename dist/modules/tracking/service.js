"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingService = void 0;
const uuid_1 = require("uuid");
const tracking_repository_1 = require("./tracking.repository");
class TrackingService {
    constructor() {
        this.repo = new tracking_repository_1.TrackingRepository();
    }
    static getInstance() {
        if (!TrackingService.instance) {
            TrackingService.instance = new TrackingService();
        }
        return TrackingService.instance;
    }
    initTracking(params) {
        const now = new Date();
        const initialStatus = params.success ? 'sent' : 'failed';
        const record = {
            id: (0, uuid_1.v4)(),
            notificationId: params.notificationId,
            channel: params.channel,
            provider: params.provider,
            providerMessageId: params.providerMessageId,
            recipient: params.recipient,
            attempts: params.attempts,
            status: initialStatus,
            createdAt: now,
            updatedAt: now,
            statusHistory: [
                { status: 'pending', timestamp: now },
                { status: initialStatus, timestamp: now, reason: params.error },
            ],
        };
        this.repo.save(record);
        return record;
    }
    handleWebhookEvent(providerMessageId, rawStatus, reason) {
        const record = this.repo.findByProviderMessageId(providerMessageId);
        if (!record) {
            console.warn(`[Tracking] No record found for providerMessageId: ${providerMessageId}`);
            return;
        }
        const status = this.normalizeStatus(rawStatus);
        this.repo.updateStatus(record.notificationId, {
            status,
            timestamp: new Date(),
            reason,
        });
        console.log(`[Tracking] ${record.notificationId} → ${status}`);
    }
    getStatus(notificationId) {
        return this.repo.findByNotificationId(notificationId);
    }
    normalizeStatus(raw) {
        const map = {
            // Amazon SES
            'Delivery': 'delivered',
            'Bounce': 'failed',
            'Complaint': 'failed',
            // SendGrid
            'delivered': 'delivered',
            'bounce': 'failed',
            'blocked': 'failed',
            'dropped': 'failed',
            // Twilio
            'failed': 'failed',
            'undelivered': 'failed',
            'sent': 'sent',
            // Vonage
            'rejected': 'failed',
        };
        return map[raw] ?? 'sent';
    }
}
exports.TrackingService = TrackingService;
