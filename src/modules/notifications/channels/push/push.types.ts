export interface PushPayload {
  to: string;        // token del dispositivo
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  attempts: number;
}

export interface IPushProvider {
  readonly name: string;
  readonly priority: number;
  send(payload: PushPayload): Promise<PushResult>;
  isHealthy(): Promise<boolean>;
}