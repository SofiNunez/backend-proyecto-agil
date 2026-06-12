"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailChannel = void 0;
const ses_provider_1 = require("./providers/ses.provider");
const sendgrid_provider_1 = require("./providers/sendgrid.provider");
class EmailChannel {
    constructor() {
        // Se ordenan por prioridad automáticamente
        this.providers = [
            new ses_provider_1.SESEmailProvider(),
            new sendgrid_provider_1.SendGridEmailProvider(),
        ].sort((a, b) => a.priority - b.priority);
    }
    async send(payload) {
        let lastError = '';
        let attempts = 0;
        for (const provider of this.providers) {
            const healthy = await provider.isHealthy();
            if (!healthy) {
                console.warn(`[EmailChannel] Provider ${provider.name} is not healthy, skipping`);
                continue;
            }
            attempts++;
            console.log(`[EmailChannel] Trying provider: ${provider.name}`);
            const result = await provider.send(payload);
            if (result.success) {
                console.log(`[EmailChannel] Sent via ${provider.name}, messageId: ${result.messageId}`);
                return { ...result, attempts };
            }
            console.error(`[EmailChannel] Provider ${provider.name} failed: ${result.error}`);
            lastError = result.error || 'Unknown error';
            // Continúa al siguiente proveedor (fallback)
        }
        return {
            success: false,
            provider: 'none',
            error: `All email providers failed. Last error: ${lastError}`,
            attempts,
        };
    }
}
exports.EmailChannel = EmailChannel;
