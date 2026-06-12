"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_1 = require("./service");
const router = (0, express_1.Router)();
const notificationsService = service_1.NotificationsService.getInstance();
router.post('/send', async (req, res) => {
    try {
        const result = await notificationsService.sendNotification(req.body);
        if (!result?.success) {
            res.status(502).json({
                message: 'No se pudo enviar la notificación por ningún proveedor',
                provider: result?.provider,
                error: result?.error,
            });
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
