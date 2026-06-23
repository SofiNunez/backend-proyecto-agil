import { NotificationsService } from '../modules/notifications/service';
import { v4 as uuidv4 } from 'uuid';

interface QueueJob {
  id: string;
  notificationId: string;
  data: any;
  attempts: number;
}

class NotificationQueue {
  private queue: QueueJob[] = [];
  private processing = false;
  private concurrency = 0;
  private readonly MAX_CONCURRENCY = 5;
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly MAX_ATTEMPTS = 3;

  async add(data: any): Promise<{ id: string; notificationId: string; queued: boolean }> {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      return { id: '', notificationId: '', queued: false };
    }

    const notificationId = uuidv4(); // ← se genera aquí antes de encolar
    const job: QueueJob = { id: uuidv4(), notificationId, data: { ...data, notificationId }, attempts: 0 };
    this.queue.push(job);
    console.log(`[Queue] Job ${job.id} agregado. En cola: ${this.queue.length}`);

    this.process();
    return { id: job.id, notificationId, queued: true };
  }

  private async process() {
    if (this.processing || this.concurrency >= this.MAX_CONCURRENCY) return;
    if (this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0 && this.concurrency < this.MAX_CONCURRENCY) {
      const job = this.queue.shift()!;
      this.concurrency++;

      this.processJob(job).finally(() => {
        this.concurrency--;
        this.process();
      });
    }

    this.processing = false;
  }

  private async processJob(job: QueueJob) {
    try {
      job.attempts++;
      console.log(`[Queue] Procesando job ${job.id}, intento ${job.attempts}`);
      const service = NotificationsService.getInstance();
      await service.sendNotification(job.data);
      console.log(`[Queue] Job ${job.id} completado`);
    } catch (error: any) {
      console.error(`[Queue] Job ${job.id} falló: ${error.message}`);
      if (job.attempts < this.MAX_ATTEMPTS) {
        const delay = 1000 * Math.pow(2, job.attempts);
        console.log(`[Queue] Reintentando job ${job.id} en ${delay}ms`);
        setTimeout(() => {
          this.queue.unshift(job);
          this.process();
        }, delay);
      } else {
        console.error(`[Queue] Job ${job.id} descartado tras ${job.attempts} intentos`);
      }
    }
  }

  status() {
    return {
      enCola: this.queue.length,
      procesando: this.concurrency,
      capacidadMaxima: this.MAX_QUEUE_SIZE,
    };
  }
}

export const notificationQueue = new NotificationQueue();