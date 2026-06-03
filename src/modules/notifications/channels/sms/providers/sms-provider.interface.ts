import { SMSPayload, SMSResult } from '../../sms/sms.types'

export interface ISMSProvider {
  readonly name: string
  readonly priority: number
  send(payload: SMSPayload): Promise<SMSResult>
  isHealthy(): Promise<boolean>
}