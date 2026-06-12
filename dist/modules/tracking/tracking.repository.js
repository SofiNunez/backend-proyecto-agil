"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingRepository = void 0;
const store = new Map();
const byProviderMessageId = new Map();
class TrackingRepository {
    save(record) {
        store.set(record.notificationId, record);
        if (record.providerMessageId) {
            byProviderMessageId.set(record.providerMessageId, record.notificationId);
        }
    }
    findByNotificationId(notificationId) {
        return store.get(notificationId);
    }
    findByProviderMessageId(providerMessageId) {
        const notificationId = byProviderMessageId.get(providerMessageId);
        return notificationId ? store.get(notificationId) : undefined;
    }
    updateStatus(notificationId, event) {
        const record = store.get(notificationId);
        if (!record)
            return undefined;
        record.status = event.status;
        record.updatedAt = new Date();
        record.statusHistory.push(event);
        store.set(notificationId, record);
        return record;
    }
}
exports.TrackingRepository = TrackingRepository;
