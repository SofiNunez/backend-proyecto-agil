import twilio from 'twilio'
import { ISMSProvider } from './sms-provider.interface'
import { SMSPayload, SMSResult } from '../../sms/sms.types'

export class TwilioProvider implements ISMSProvider {
  readonly name = 'twilio'
  readonly priority = 1
  private client

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch()
      return true
    } catch {
      return false
    }
  }

  async send(payload: SMSPayload): Promise<SMSResult> {
    try {
      const result = await this.client.messages.create({
        body: payload.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: payload.to
      })
      return {
        success: true,
        provider: this.name,
        messageId: result.sid
      }
    } catch (error: any) {
      return {
        success: false,
        provider: this.name,
        error: error.message
      }
    }
  }
}