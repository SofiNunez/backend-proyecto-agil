export interface SMSPayload {
  to: string
  message: string
}

export interface SMSResult {
  success: boolean
  messageId?: string
  provider: string
  error?: string
}