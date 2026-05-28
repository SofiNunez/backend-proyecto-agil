"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
router.post('/', notification_controller_1.createNotification);
router.get('/:id', notification_controller_1.getNotification);
exports.default = router;
