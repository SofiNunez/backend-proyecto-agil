"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSChannel = void 0;
const twilio_provider_1 = require("./providers/twilio.provider");
const vonage_provider_1 = require("./providers/vonage.provider");
class SMSChannel {
    constructor() {
        this.providers = [
            new twilio_provider_1.TwilioProvider(),
            new vonage_provider_1.VonageProvider()
        ].sort((a, b) => a.priority - b.priority);
    }
    async send(payload) {
        let ultimoError = '';
        let intentos = 0;
        for (const provider of this.providers) {
            const disponible = await provider.isHealthy();
            if (!disponible) {
                console.warn(`[SMSChannel] Proveedor ${provider.name} no está disponible, saltando`);
                continue;
            }
            intentos++;
            console.log(`[SMSChannel] Intentando con proveedor: ${provider.name}`);
            const resultado = await provider.send(payload);
            if (resultado.success) {
                console.log(`[SMSChannel] SMS enviado por ${provider.name}, messageId: ${resultado.messageId}`);
                return { ...resultado, attempts: intentos };
            }
            console.error(`[SMSChannel] Proveedor ${provider.name} falló: ${resultado.error}`);
            ultimoError = resultado.error || 'Error desconocido';
        }
        return {
            success: false,
            provider: 'ninguno',
            error: `Todos los proveedores SMS fallaron. Último error: ${ultimoError}`,
            attempts: intentos
        };
    }
}
exports.SMSChannel = SMSChannel;
