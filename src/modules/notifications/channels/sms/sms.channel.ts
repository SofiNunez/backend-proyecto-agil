import { ISMSProvider, SMSPayload, SMSResult } from './sms.types'
import { TwilioProvider } from './providers/twilio.provider'
import { VonageProvider } from './providers/vonage.provider'

export class SMSChannel {
  private providers: ISMSProvider[]

  constructor() {
    this.providers = [
      new TwilioProvider(),
      new VonageProvider()
    ].sort((a, b) => a.priority - b.priority)
  }

  async send(payload: SMSPayload): Promise<SMSResult & { attempts: number }> {
    let ultimoError = ''
    let intentos = 0

    for (const provider of this.providers) {
      const disponible = await provider.isHealthy()
      if (!disponible) {
        console.warn(`[SMSChannel] Proveedor ${provider.name} no está disponible, saltando`)
        continue
      }

      intentos++
      console.log(`[SMSChannel] Intentando con proveedor: ${provider.name}`)

      const resultado = await provider.send(payload)
      if (resultado.success) {
        console.log(`[SMSChannel] SMS enviado por ${provider.name}, messageId: ${resultado.messageId}`)
        return { ...resultado, attempts: intentos }
      }

      console.error(`[SMSChannel] Proveedor ${provider.name} falló: ${resultado.error}`)
      ultimoError = resultado.error || 'Error desconocido'
    }

    return {
      success: false,
      provider: 'ninguno',
      error: `Todos los proveedores SMS fallaron. Último error: ${ultimoError}`,
      attempts: intentos
    }
  }
}