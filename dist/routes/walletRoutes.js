"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletController_1 = require("../controllers/walletController");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../types/validation");
const idempotency_1 = require("../middleware/idempotency");
const router = (0, express_1.Router)();
// Wallet routes
router.post('/', (0, validation_1.validateBody)(validation_2.CreateWalletSchema), (0, idempotency_1.idempotencyProtection)(), walletController_1.walletController.createWallet.bind(walletController_1.walletController));
router.get('/:userId', (0, validation_1.validateParams)(validation_2.GetWalletSchema), walletController_1.walletController.getWallet.bind(walletController_1.walletController));
router.get('/:userId/balance', (0, validation_1.validateParams)(validation_2.GetWalletSchema), walletController_1.walletController.getWalletBalance.bind(walletController_1.walletController));
router.get('/:userId/ledger', (0, validation_1.validateParams)(validation_2.GetWalletSchema), (0, validation_1.validateQuery)(validation_2.PaginationSchema), walletController_1.walletController.getLedgerEntries.bind(walletController_1.walletController));
router.post('/:userId/lock-funds', (0, validation_1.validateParams)(validation_2.GetWalletSchema), (0, validation_1.validateBody)(validation_2.CreateWalletSchema.extend({
    amount: validation_2.CreateWalletSchema.shape.userId,
    description: validation_2.CreateWalletSchema.shape.currency.optional(),
})), walletController_1.walletController.lockFunds.bind(walletController_1.walletController));
router.post('/:userId/unlock-funds', (0, validation_1.validateParams)(validation_2.GetWalletSchema), (0, validation_1.validateBody)(validation_2.CreateWalletSchema.extend({
    amount: validation_2.CreateWalletSchema.shape.userId,
    description: validation_2.CreateWalletSchema.shape.currency.optional(),
})), walletController_1.walletController.unlockFunds.bind(walletController_1.walletController));
exports.default = router;
//# sourceMappingURL=walletRoutes.js.map