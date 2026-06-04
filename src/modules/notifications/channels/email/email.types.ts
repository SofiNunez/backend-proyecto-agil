export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  attempts: number;
}

export interface IEmailProvider {
  readonly name: string;
  readonly priority: number;
  send(payload: EmailPayload): Promise<EmailResult>;
  isHealthy(): Promise<boolean>;
}