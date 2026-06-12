"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("./modules/notifications/controller"));
const controller_2 = __importDefault(require("./modules/tracking/controller"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use('/notifications', auth_middleware_1.authMiddleware, controller_1.default);
app.use('/tracking', controller_2.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
