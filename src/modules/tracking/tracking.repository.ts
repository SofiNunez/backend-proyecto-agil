import { TrackingRecord, StatusEvent } from './tracking.types';

const store = new Map<string, TrackingRecord>();
const byProviderMessageId = new Map<string, string>();

export class TrackingRepository {

  save(record: TrackingRecord): void {
    store.set(record.notificationId, record);
    if (record.providerMessageId) {
      byProviderMessageId.set(record.providerMessageId, record.notificationId);
    }
  }

  findByNotificationId(notificationId: string): TrackingRecord | undefined {
    return store.get(notificationId);
  }

  findByProviderMessageId(providerMessageId: string): TrackingRecord | undefined {
    const notificationId = byProviderMessageId.get(providerMessageId);
    return notificationId ? store.get(notificationId) : undefined;
  }

  updateStatus(notificationId: string, event: StatusEvent): TrackingRecord | undefined {
    const record = store.get(notificationId);
    if (!record) return undefined;

    record.status = event.status;
    record.updatedAt = new Date();
    record.statusHistory.push(event);
    store.set(notificationId, record);
    return record;
  }
}