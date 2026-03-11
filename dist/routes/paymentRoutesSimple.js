"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentServiceSimple_1 = require("../services/paymentServiceSimple");
const router = (0, express_1.Router)();
// Simple Paystack payment initialization (no database transactions)
router.post('/:endpoint/paystack/simple', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const { amount, customerEmail, description, redirectUrl } = req.body;
        // Ensure endpoint is a string
        const paymentEndpoint = Array.isArray(endpoint) ? endpoint[0] : endpoint;
        // Basic validation
        if (!amount || !customerEmail) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Amount and customerEmail are required'
                }
            });
        }
        console.log('🚀 Simple Paystack payment request received');
        console.log('Endpoint:', paymentEndpoint);
        console.log('Amount:', amount);
        console.log('Email:', customerEmail);
        // Process payment with simple service
        const result = await paymentServiceSimple_1.SimplePaymentService.processPaymentWithPaystack(paymentEndpoint, amount, customerEmail, description, redirectUrl);
        if (result.success) {
            console.log('✅ Simple payment successful');
            return res.status(200).json({
                success: true,
                data: result.data
            });
        }
        else {
            console.log('❌ Simple payment failed:', result.error);
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('❌ Unexpected error in simple payment:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Internal server error'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=paymentRoutesSimple.js.map