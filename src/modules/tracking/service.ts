import { PrismaTrackingRepository } from './prisma.repository';
import { TrackingRecord, NotificationStatus, InitTrackingDto } from './tracking.types';

export class TrackingService {
  private static instance: TrackingService;
  private repo: PrismaTrackingRepository;

  private constructor() {
    this.repo = new PrismaTrackingRepository();
  }

  static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  async initTracking(params: InitTrackingDto): Promise<TrackingRecord> {
    return await this.repo.save(params);
  }

  async handleWebhookEvent(providerMessageId: string, rawStatus: string, reason?: string): Promise<void> {
    const record = await this.repo.findByProviderMessageId(providerMessageId);
    if (!record) {
      console.warn(`[Tracking] No record found for providerMessageId: ${providerMessageId}`);
      return;
    }
    const status = this.normalizeStatus(rawStatus);
    await this.repo.updateStatus(record.notificationId, {
      status,
      timestamp: new Date(),
      reason,
    });
    console.log(`[Tracking] ${record.notificationId} → ${status}`);
  }

  async getStatus(notificationId: string): Promise<TrackingRecord | undefined> {
    return await this.repo.findByNotificationId(notificationId);
  }

  async getStatusByProviderMessageId(providerMessageId: string): Promise<TrackingRecord | undefined> {
    return await this.repo.findByProviderMessageId(providerMessageId);
  }

  private normalizeStatus(raw: string): NotificationStatus {
  const map: Record<string, NotificationStatus> = {
    // Amazon SES
    'Delivery':    'delivered',
    'Bounce':      'failed',
    'Complaint':   'failed',
    // SendGrid
    'delivered':   'delivered',
    'bounce':      'failed',
    'blocked':     'failed',
    'dropped':     'failed',
    // Twilio
    'failed':      'failed',
    'undelivered': 'failed',
    'sent':        'sent',
    // Vonage
    'rejected':    'failed',
  };
  return map[raw] ?? 'pending';
}
}