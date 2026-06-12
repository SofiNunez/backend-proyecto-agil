"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VonageProvider = void 0;
const server_sdk_1 = require("@vonage/server-sdk");
class VonageProvider {
    constructor() {
        this.name = 'vonage';
        this.priority = 2;
        this.client = new server_sdk_1.Vonage({
            apiKey: process.env.VONAGE_API_KEY,
            apiSecret: process.env.VONAGE_API_SECRET
        });
    }
    async isHealthy() {
        try {
            await this.client.accounts.getBalance();
            return true;
        }
        catch {
            return false;
        }
    }
    async send(payload) {
        try {
            const resultado = await this.client.sms.send({
                to: payload.to,
                from: process.env.VONAGE_PHONE_NUMBER,
                text: payload.message
            });
            return {
                success: true,
                provider: this.name,
                messageId: resultado.messages[0]['message-id'],
                attempts: 1
            };
        }
        catch (error) {
            return {
                success: false,
                provider: this.name,
                error: error.message,
                attempts: 1
            };
        }
    }
}
exports.VonageProvider = VonageProvider;
