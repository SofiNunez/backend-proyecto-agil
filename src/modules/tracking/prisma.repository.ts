import { PrismaClient } from '.prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { TrackingRecord, StatusEvent, InitTrackingDto, NotificationStatus } from './tracking.types'
import { v4 as uuidv4 } from 'uuid'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export class PrismaTrackingRepository {
  async save(params: InitTrackingDto): Promise<TrackingRecord> {
    const now = new Date()
    const initialStatus: NotificationStatus = params.success ? 'sent' : 'failed'
    const statusHistory: StatusEvent[] = [
      { status: 'pending', timestamp: now },
      { status: initialStatus, timestamp: now, reason: params.error }
    ]
    const record = await prisma.notification.create({
      data: {
        id: uuidv4(),
        notificationId: params.notificationId,
        channel: params.channel,
        provider: params.provider,
        providerMessageId: params.providerMessageId,
        recipient: params.recipient,
        attempts: params.attempts,
        status: initialStatus,
        statusHistory: statusHistory as any,
      }
    })
    return this.toTrackingRecord(record)
  }

  async findByNotificationId(notificationId: string): Promise<TrackingRecord | undefined> {
    const record = await prisma.notification.findUnique({
      where: { notificationId }
    })
    return record ? this.toTrackingRecord(record) : undefined
  }

  async findByProviderMessageId(providerMessageId: string): Promise<TrackingRecord | undefined> {
    const record = await prisma.notification.findFirst({
      where: { providerMessageId }
    })
    return record ? this.toTrackingRecord(record) : undefined
  }

  async updateStatus(notificationId: string, event: StatusEvent): Promise<TrackingRecord | undefined> {
  const existing = await prisma.notification.findUnique({
    where: { notificationId }
  })
  if (!existing) return undefined
  
  const statusHistory = [...(existing.statusHistory as any[]), event]
  
  const record = await prisma.notification.update({
    where: { notificationId },
    data: {
      status: event.status,  
      updatedAt: new Date(),
      statusHistory: statusHistory as any,
    }
  })
  return this.toTrackingRecord(record)
}

  private toTrackingRecord(record: any): TrackingRecord {
    return {
      id: record.id,
      notificationId: record.notificationId,
      channel: record.channel as any,
      provider: record.provider,
      providerMessageId: record.providerMessageId,
      recipient: record.recipient,
      attempts: record.attempts,
      status: record.status as NotificationStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      statusHistory: record.statusHistory as StatusEvent[],
    }
  }
}