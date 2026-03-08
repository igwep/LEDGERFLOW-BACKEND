"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const withdrawalController_1 = require("../controllers/withdrawalController");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../types/validation");
const idempotency_1 = require("../middleware/idempotency");
const router = (0, express_1.Router)();
// Withdrawal routes
router.post('/', (0, validation_1.validateBody)(validation_2.CreateWithdrawalSchema), (0, idempotency_1.idempotencyProtection)(), withdrawalController_1.withdrawalController.createWithdrawal.bind(withdrawalController_1.withdrawalController));
router.post('/:withdrawalId/process', (0, validation_1.validateParams)(validation_2.GetTransactionSchema), (0, validation_1.validateBody)(validation_2.GetTransactionSchema.extend({
    status: validation_2.GetTransactionSchema.shape.reference,
    transferRef: validation_2.GetTransactionSchema.shape.reference.optional(),
    metadata: validation_2.GetTransactionSchema.shape.reference.optional(),
})), withdrawalController_1.withdrawalController.processWithdrawal.bind(withdrawalController_1.withdrawalController));
router.get('/:withdrawalId', (0, validation_1.validateParams)(validation_2.GetTransactionSchema), withdrawalController_1.withdrawalController.getWithdrawal.bind(withdrawalController_1.withdrawalController));
router.get('/user/:userId', (0, validation_1.validateParams)(validation_2.GetTransactionSchema.extend({
    userId: validation_2.GetTransactionSchema.shape.reference,
})), (0, validation_1.validateQuery)(validation_2.PaginationSchema.extend({
    status: validation_2.GetTransactionSchema.shape.reference.optional(),
})), withdrawalController_1.withdrawalController.listWithdrawals.bind(withdrawalController_1.withdrawalController));
router.post('/:withdrawalId/cancel', (0, validation_1.validateParams)(validation_2.GetTransactionSchema), (0, validation_1.validateBody)(validation_2.GetTransactionSchema.extend({
    reason: validation_2.GetTransactionSchema.shape.reference.optional(),
})), withdrawalController_1.withdrawalController.cancelWithdrawal.bind(withdrawalController_1.withdrawalController));
router.get('/user/:userId/stats', (0, validation_1.validateParams)(validation_2.GetTransactionSchema.extend({
    userId: validation_2.GetTransactionSchema.shape.reference,
})), (0, validation_1.validateQuery)(validation_2.PaginationSchema.extend({
    startDate: validation_2.GetTransactionSchema.shape.reference.optional(),
    endDate: validation_2.GetTransactionSchema.shape.reference.optional(),
})), withdrawalController_1.withdrawalController.getWithdrawalStats.bind(withdrawalController_1.withdrawalController));
exports.default = router;
//# sourceMappingURL=withdrawalRoutes.js.map