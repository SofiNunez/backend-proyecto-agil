import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos de notificación
import { TrackingRepository } from './tracking.repository';
import { TrackingRecord, NotificationStatus, InitTrackingDto } from './tracking.types';

export class TrackingService {
  private static instance: TrackingService;
  private repo: TrackingRepository;

  private constructor() {
    this.repo = new TrackingRepository();
  }

  static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  initTracking(params: InitTrackingDto): TrackingRecord {
    const now = new Date();
    const initialStatus: NotificationStatus = params.success ? 'sent' : 'failed';

    const record: TrackingRecord = {
      id: uuidv4(),
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

  handleWebhookEvent(providerMessageId: string, rawStatus: string, reason?: string): void {
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

  getStatus(notificationId: string): TrackingRecord | undefined {
    return this.repo.findByNotificationId(notificationId);
  }

  private normalizeStatus(raw: string): NotificationStatus {
    const map: Record<string, NotificationStatus> = {
      // Amazon SES
      'Delivery':  'delivered',
      'Bounce':    'failed',
      'Complaint': 'failed',
      // SendGrid
      'delivered': 'delivered',
      'bounce':    'failed',
      'blocked':   'failed',
      'dropped':   'failed',
    };
    return map[raw] ?? 'sent';
  }
}