"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionController_1 = require("../controllers/transactionController");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../types/validation");
const idempotency_1 = require("../middleware/idempotency");
const router = (0, express_1.Router)();
// Transaction routes
router.post('/', (0, validation_1.validateBody)(validation_2.InitializeTransactionSchema), (0, idempotency_1.idempotencyProtection)(), transactionController_1.transactionController.initializeTransaction.bind(transactionController_1.transactionController));
router.post('/:reference/process', (0, validation_1.validateParams)(validation_2.GetTransactionSchema), (0, validation_1.validateBody)(validation_2.GetTransactionSchema.extend({
    providerRef: validation_2.GetTransactionSchema.shape.reference.optional(),
    metadata: validation_2.GetTransactionSchema.shape.reference.optional(),
})), transactionController_1.transactionController.processTransaction.bind(transactionController_1.transactionController));
router.get('/:reference', (0, validation_1.validateParams)(validation_2.GetTransactionSchema), transactionController_1.transactionController.getTransaction.bind(transactionController_1.transactionController));
router.get('/user/:userId', (0, validation_1.validateParams)(validation_2.GetTransactionSchema.extend({
    userId: validation_2.GetTransactionSchema.shape.reference,
})), (0, validation_1.validateQuery)(validation_2.ListTransactionsSchema), transactionController_1.transactionController.listTransactions.bind(transactionController_1.transactionController));
router.post('/:reference/fail', (0, validation_1.validateParams)(validation_2.GetTransactionSchema), (0, validation_1.validateBody)(validation_2.GetTransactionSchema.extend({
    reason: validation_2.GetTransactionSchema.shape.reference.optional(),
})), transactionController_1.transactionController.failTransaction.bind(transactionController_1.transactionController));
router.post('/:reference/reverse', (0, validation_1.validateParams)(validation_2.GetTransactionSchema), (0, validation_1.validateBody)(validation_2.GetTransactionSchema.extend({
    reason: validation_2.GetTransactionSchema.shape.reference.optional(),
})), transactionController_1.transactionController.reverseTransaction.bind(transactionController_1.transactionController));
router.get('/:reference/fraud-score', (0, validation_1.validateParams)(validation_2.GetTransactionSchema), transactionController_1.transactionController.getTransactionFraudScore.bind(transactionController_1.transactionController));
exports.default = router;
//# sourceMappingURL=transactionRoutes.js.map