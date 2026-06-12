export interface SMSPayload {
  to: string
  message: string
  from?: string
}

export interface SMSResult {
  success: boolean
  messageId?: string
  provider: string
  error?: string
  attempts: number
}

export interface ISMSProvider {
  readonly name: string
  readonly priority: number
  send(payload: SMSPayload): Promise<SMSResult>
  isHealthy(): Promise<boolean>
}