"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioProvider = void 0;
const twilio_1 = __importDefault(require("twilio"));
class TwilioProvider {
    constructor() {
        this.name = 'twilio';
        this.priority = 1;
        this.client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    async isHealthy() {
        try {
            await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
            return true;
        }
        catch {
            return false;
        }
    }
    async send(payload) {
        try {
            const resultado = await this.client.messages.create({
                body: payload.message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: payload.to
            });
            return {
                success: true,
                provider: this.name,
                messageId: resultado.sid,
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
exports.TwilioProvider = TwilioProvider;
