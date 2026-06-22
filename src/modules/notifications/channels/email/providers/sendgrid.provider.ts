import sgMail from '@sendgrid/mail';
import { IEmailProvider, EmailPayload, EmailResult } from '../email.types';

export class SendGridEmailProvider implements IEmailProvider {
  readonly name = 'sendgrid';
  readonly priority = 1;

  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
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
        attempts: 1,
      };
    } catch (error: any) {
      return { success: false, provider: this.name, error: error.message, attempts: 1 };
    }
  }

  async isHealthy(): Promise<boolean> {
    return !!process.env.SENDGRID_API_KEY;
  }
}