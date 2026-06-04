import sgMail from '@sendgrid/mail';
import { IEmailProvider, EmailPayload, EmailResult } from './email-provider.interface';

export class SendGridEmailProvider implements IEmailProvider {
  readonly name = 'sendgrid';
  readonly priority = 2; // fallback

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async send(payload: EmailPayload): Promise<EmailResult> {
    try {
      const [response] = await sgMail.send({
        to: payload.to,
        from: payload.from || process.env.EMAIL_FROM!,
        subject: payload.subject,
        html: payload.html,
        ...(payload.text && { text: payload.text }),
      });

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
        provider: this.name,
      };
    } catch (error: any) {
      return { success: false, provider: this.name, error: error.message };
    }
  }

  async isHealthy(): Promise<boolean> {
    return !!process.env.SENDGRID_API_KEY;
  }
}