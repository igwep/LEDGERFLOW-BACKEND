"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { webhookController } from '../controllers/webhookController';
const router = (0, express_1.Router)();
console.log('🔗 Webhook routes module loaded');
// Simple test route
router.post('/:provider', (req, res) => {
    console.log('🎯 Webhook POST route hit:', req.params.provider);
    res.json({
        success: true,
        message: 'Webhook route working!',
        provider: req.params.provider,
        body: req.body
    });
});
console.log('📝 Webhook routes registered:');
console.log('  POST /:provider');
exports.default = router;
//# sourceMappingURL=webhookRoutes.js.map