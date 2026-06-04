import { IEmailProvider, EmailPayload, EmailResult } from './providers/email-provider.interface';
import { SESEmailProvider } from './providers/ses.provider';
import { SendGridEmailProvider } from './providers/sendgrid.provider';

export class EmailChannel {
  private providers: IEmailProvider[];

  constructor() {
    // Se ordenan por prioridad automáticamente
    this.providers = [
      new SESEmailProvider(),
      new SendGridEmailProvider(),
    ].sort((a, b) => a.priority - b.priority);
  }

  async send(payload: EmailPayload): Promise<EmailResult & { attempts: number }> {
    let lastError = '';
    let attempts = 0;

    for (const provider of this.providers) {
      const healthy = await provider.isHealthy();
      if (!healthy) {
        console.warn(`[EmailChannel] Provider ${provider.name} is not healthy, skipping`);
        continue;
      }

      attempts++;
      console.log(`[EmailChannel] Trying provider: ${provider.name}`);
      const result = await provider.send(payload);

      if (result.success) {
        console.log(`[EmailChannel] Sent via ${provider.name}, messageId: ${result.messageId}`);
        return { ...result, attempts };
      }

      console.error(`[EmailChannel] Provider ${provider.name} failed: ${result.error}`);
      lastError = result.error || 'Unknown error';
      // Continúa al siguiente proveedor (fallback)
    }

    return {
      success: false,
      provider: 'none',
      error: `All email providers failed. Last error: ${lastError}`,
      attempts,
    };
  }
}