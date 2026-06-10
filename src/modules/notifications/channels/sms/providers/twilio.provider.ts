import twilio from 'twilio'
import { ISMSProvider, SMSPayload, SMSResult } from '../sms.types'

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
      const resultado = await this.client.messages.create({
        body: payload.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: payload.to
      })
      return {
        success: true,
        provider: this.name,
        messageId: resultado.sid,
        attempts: 1
      }
    } catch (error: any) {
      return {
        success: false,
        provider: this.name,
        error: error.message,
        attempts: 1
      }
    }
  }
}