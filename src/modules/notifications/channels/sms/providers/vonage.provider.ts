import { Vonage } from '@vonage/server-sdk'
import { ISMSProvider, SMSPayload, SMSResult } from '../sms.types'

export class VonageProvider implements ISMSProvider {
  readonly name = 'vonage'
  readonly priority = 2
  private client

  constructor() {
    this.client = new Vonage({
      apiKey: process.env.VONAGE_API_KEY!,
      apiSecret: process.env.VONAGE_API_SECRET!
    })
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.accounts.getBalance()
      return true
    } catch {
      return false
    }
  }

  async send(payload: SMSPayload): Promise<SMSResult> {
    try {
      const resultado = await this.client.sms.send({
        to: payload.to,
        from: process.env.VONAGE_PHONE_NUMBER!,
        text: payload.message
      })
      return {
        success: true,
        provider: this.name,
        messageId: resultado.messages[0]['message-id'],
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