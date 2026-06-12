"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridEmailProvider = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
class SendGridEmailProvider {
    constructor() {
        this.name = 'sendgrid';
        this.priority = 3;
        if (process.env.SENDGRID_API_KEY) {
            mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        }
    }
    async send(payload) {
        try {
            const [response] = await mail_1.default.send({
                to: payload.to,
                from: payload.from || process.env.EMAIL_FROM,
                subject: payload.subject,
                html: payload.html,
                ...(payload.text && { text: payload.text }),
            });
            return {
                success: true,
                messageId: response.headers['x-message-id'],
                provider: this.name,
                attempts: 1,
            };
        }
        catch (error) {
            return { success: false, provider: this.name, error: error.message, attempts: 1 };
        }
    }
    async isHealthy() {
        return !!process.env.SENDGRID_API_KEY;
    }
}
exports.SendGridEmailProvider = SendGridEmailProvider;
