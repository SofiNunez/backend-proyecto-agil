import { ISMSProvider, SMSPayload, SMSResult } from './providers/sms-provider.interface'
import { TwilioProvider } from './providers/twilio.provider'
import { VonageProvider } from './providers/vonage.provider'
import config from '../../../../../config.json'

export class SMSChannel {
  private static instance: SMSChannel
  private providers: ISMSProvider[]

  private constructor() {
    const active = config.sms.activeProvider

    this.providers = [
      new TwilioProvider(),
      new VonageProvider()
    ].sort((a, b) =>
      a.name === active ? -1 : b.name === active ? 1 : a.priority - b.priority
    )
  }

  static getInstance(): SMSChannel {
    if (!SMSChannel.instance) {
      SMSChannel.instance = new SMSChannel()
    }
    return SMSChannel.instance
  }

  async send(payload: SMSPayload): Promise<SMSResult> {
    for (const provider of this.providers) {
      const healthy = await provider.isHealthy()
      if (!healthy) {
        console.log(`${provider.name} no está disponible, saltando...`)
        continue
      }
      const result = await provider.send(payload)
      if (result.success) {
        console.log(`SMS enviado por ${result.provider}`)
        return result
      }
      console.log(`${result.provider} falló, intentando siguiente proveedor...`)
    }
    return {
      success: false,
      provider: 'ninguno',
      error: 'ambos_proveedores_fallaron'
    }
  }
}