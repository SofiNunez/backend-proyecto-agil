export class AnalyticsService {
  private static readonly URL = 'https://analisis-proyecto-ti.onrender.com/v1/events'

  static async notificacionEnviada(
    idNotificacion: string,
    canalUsado: string,
    intentos: number,
    extras?: {
      id_api_key?: string
      destinatario_email?: string
      destinatario_telefono?: string
      mensaje_asunto?: string
      mensaje_email?: string
      mensaje_sms?: string
    }
  ) {
    try {
      const res = await fetch(AnalyticsService.URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'notifications',
          event_type: 'notificacion_enviada',
          payload: {
            id_notificacion: idNotificacion,
            canal_usado: canalUsado,
            intentos,
            ...extras
          }
        })
      })
      console.log(`[Analytics] notificacion_enviada enviado → status ${res.status}`)
    } catch (error) {
      console.error('[Analytics] Error enviando evento notificacion_enviada:', error)
    }
  }

  static async notificacionEntregada(idNotificacion: string, canalUsado: string) {
    try {
      const res = await fetch(AnalyticsService.URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'notifications',
          event_type: 'notificacion_entregada',
          payload: {
            id_notificacion: idNotificacion,
            canal_usado: canalUsado
          }
        })
      })
      console.log(`[Analytics] notificacion_entregada enviado → status ${res.status}`)
    } catch (error) {
      console.error('[Analytics] Error enviando evento notificacion_entregada:', error)
    }
  }

  static async fallbackActivado(idNotificacion: string, canalFallback: string) {
    try {
      const res = await fetch(AnalyticsService.URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'notifications',
          event_type: 'fallback_activado',
          payload: {
            id_notificacion: idNotificacion,
            canal_fallback: canalFallback
          }
        })
      })
      console.log(`[Analytics] fallback_activado enviado → status ${res.status}`)
    } catch (error) {
      console.error('[Analytics] Error enviando evento fallback_activado:', error)
    }
  }

  static async notificacionFallida(
    idNotificacion: string,
    canalUsado: string,
    intentos: number,
    extras?: {
      id_api_key?: string
      destinatario_email?: string
      razon?: string
    }
  ) {
    try {
      const res = await fetch(AnalyticsService.URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'notifications',
          event_type: 'notificacion_fallida',
          payload: {
            id_notificacion: idNotificacion,
            canal_usado: canalUsado,
            intentos,
            ...extras
          }
        })
      })
      console.log(`[Analytics] notificacion_fallida enviado → status ${res.status}`)
    } catch (error) {
      console.error('[Analytics] Error enviando evento notificacion_fallida:', error)
    }
  }
}