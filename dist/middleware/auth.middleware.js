"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const apiKeys = [
    { id: 1, key: process.env.API_KEY_PROYECTO_1, active: true },
    { id: 3, key: process.env.API_KEY_PROYECTO_3, active: true },
    { id: 4, key: process.env.API_KEY_PROYECTO_4, active: true },
    { id: 5, key: process.env.API_KEY_PROYECTO_5, active: true },
    { id: 8, key: process.env.API_KEY_PROYECTO_8, active: true },
    { id: 10, key: process.env.API_KEY_PROYECTO_10, active: true },
    { id: 11, key: process.env.API_KEY_PROYECTO_11, active: true },
];
const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        res.status(401).json({ message: 'API Key requerida' });
        return;
    }
    const keyValida = apiKeys.find((k) => k.key === apiKey && k.active === true);
    if (!keyValida) {
        res.status(401).json({ message: 'API Key inválida o inactiva' });
        return;
    }
    next();
};
exports.authMiddleware = authMiddleware;
