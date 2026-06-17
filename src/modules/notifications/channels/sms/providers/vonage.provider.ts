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
    return true
  }

  async send(payload: SMSPayload): Promise<SMSResult> {
  try {
    const resultado = await this.client.sms.send({
      to: payload.to,
      from: process.env.VONAGE_PHONE_NUMBER!,
      text: payload.message
    })
    
    console.log('Vonage response:', JSON.stringify(resultado, null, 2))
    
    if (resultado.messages[0].status !== '0') {
      return {
        success: false,
        provider: this.name,
        error: resultado.messages[0]['errorText'],
        attempts: 1
      }
    }

    return {
      success: true,
      provider: this.name,
      messageId: resultado.messages[0]['message-id'],
      attempts: 1
    }
  } catch (error: any) {
  console.error('Vonage messages:', JSON.stringify(error.response?.messages, null, 2))
  return {
    success: false,
    provider: this.name,
    error: error.message,
    attempts: 1
  }
}
}
}