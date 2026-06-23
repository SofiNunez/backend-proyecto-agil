import { IPushProvider, PushPayload, PushResult } from './push.types';
import { FCMProvider } from './providers/fcm.provider';

export class PushChannel {
  private providers: IPushProvider[];

  constructor() {
    this.providers = [
      new FCMProvider(),
    ].sort((a, b) => a.priority - b.priority);
  }

  async send(payload: PushPayload): Promise<PushResult & { attempts: number }> {
    let lastError = '';
    let attempts = 0;

    for (const provider of this.providers) {
      const healthy = await provider.isHealthy();
      if (!healthy) {
        console.log(`[PushChannel] Proveedor ${provider.name} no disponible, saltando`);
        continue;
      }

      attempts++;
      console.log(`[PushChannel] Intentando con proveedor: ${provider.name}`);
      const result = await provider.send(payload);

      if (result.success) {
        console.log(`[PushChannel] Enviado via ${provider.name}`);
        return { ...result, attempts };
      }

      console.error(`[PushChannel] Proveedor ${provider.name} falló: ${result.error}`);
      lastError = result.error || 'Error desconocido';
    }

    return {
      success: false,
      provider: 'ninguno',
      error: `Todos los proveedores Push fallaron. Último error: ${lastError}`,
      attempts,
    };
  }
}