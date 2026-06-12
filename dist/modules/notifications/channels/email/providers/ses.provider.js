"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESEmailProvider = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
class SESEmailProvider {
    constructor() {
        this.name = 'amazon-ses';
        this.priority = 2;
        this.client = new client_ses_1.SESClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async send(payload) {
        try {
            const command = new client_ses_1.SendEmailCommand({
                Source: payload.from || process.env.EMAIL_FROM,
                Destination: {
                    ToAddresses: [payload.to],
                },
                Message: {
                    Subject: { Data: payload.subject, Charset: 'UTF-8' },
                    Body: {
                        Html: { Data: payload.html, Charset: 'UTF-8' },
                        ...(payload.text && { Text: { Data: payload.text, Charset: 'UTF-8' } }),
                    },
                },
            });
            const response = await this.client.send(command);
            return {
                success: true,
                messageId: response.MessageId,
                provider: this.name,
                attempts: 1,
            };
        }
        catch (error) {
            return { success: false, provider: this.name, error: error.message, attempts: 1 };
        }
    }
    async isHealthy() {
        return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    }
}
exports.SESEmailProvider = SESEmailProvider;
