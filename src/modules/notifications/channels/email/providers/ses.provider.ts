import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { IEmailProvider, EmailPayload, EmailResult } from '../email.types';

export class SESEmailProvider implements IEmailProvider {
  readonly name = 'amazon-ses';
  readonly priority = 2;

  private client: SESClient;

  constructor() {
    this.client = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async send(payload: EmailPayload): Promise<EmailResult> {
    try {
      const command = new SendEmailCommand({
        Source: payload.from || process.env.EMAIL_FROM!,
        Destination: {
          ToAddresses: [payload.to],
        },
        Message: {
          Subject: { Data: payload.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: payload.html, Charset: 'UTF-8' },
            ...(payload.text && { Text: { Data: payload.text, Charset: 'UTF-8' } }),
          },
        },
      });

      const response = await this.client.send(command);
      return {
        success: true,
        messageId: response.MessageId,
        provider: this.name,
        attempts: 1,
      };
    } catch (error: any) {
      return { success: false, provider: this.name, error: error.message, attempts: 1 };
    }
  }

  async isHealthy(): Promise<boolean> {
    return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }
}