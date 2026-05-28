
export interface EmailPayload {
  to: string | string[];
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
}

export interface IEmailProvider {
  readonly name: string;
  readonly priority: number; // menor = más prioritario
  send(payload: EmailPayload): Promise<EmailResult>;
  isHealthy(): Promise<boolean>;
}