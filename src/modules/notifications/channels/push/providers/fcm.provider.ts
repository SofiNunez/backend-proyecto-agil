import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { IPushProvider, PushPayload, PushResult } from '../push.types';

export class FCMProvider implements IPushProvider {
  readonly name = 'fcm';
  readonly priority = 1;

  constructor() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      if (!process.env.FIREBASE_PROJECT_ID) return;

      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      }

      console.log('[FCM] Firebase inicializado correctamente');
    } catch (error: any) {
      console.error('[FCM] Error inicializando Firebase:', error.message);
    }
  }

  async send(payload: PushPayload): Promise<PushResult> {
    try {
      const message: Message = {
        token: payload.to,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data ?? {},
      };

      const messageId = await getMessaging().send(message);

      return {
        success: true,
        messageId,
        provider: this.name,
        attempts: 1,
      };
    } catch (error: any) {
      return { success: false, provider: this.name, error: error.message, attempts: 1 };
    }
  }

  async isHealthy(): Promise<boolean> {
    return !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    );
  }
}