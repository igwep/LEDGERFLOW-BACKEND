import { Router } from 'express';
import { withdrawalController } from '../controllers/withdrawalController';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { 
  CreateWithdrawalSchema, 
  GetTransactionSchema, 
  PaginationSchema 
} from '../types/validation';
import { idempotencyProtection } from '../middleware/idempotency';

const router = Router();

// Withdrawal routes
router.post(
  '/',
  validateBody(CreateWithdrawalSchema),
  idempotencyProtection(),
  withdrawalController.createWithdrawal.bind(withdrawalController)
);

router.post(
  '/:withdrawalId/process',
  validateParams(GetTransactionSchema),
  validateBody(GetTransactionSchema.extend({
    status: GetTransactionSchema.shape.reference,
    transferRef: GetTransactionSchema.shape.reference.optional(),
    metadata: GetTransactionSchema.shape.reference.optional(),
  })),
  withdrawalController.processWithdrawal.bind(withdrawalController)
);

router.get(
  '/:withdrawalId',
  validateParams(GetTransactionSchema),
  withdrawalController.getWithdrawal.bind(withdrawalController)
);

router.get(
  '/user/:userId',
  validateParams(GetTransactionSchema.extend({
    userId: GetTransactionSchema.shape.reference,
  })),
  validateQuery(PaginationSchema.extend({
    status: GetTransactionSchema.shape.reference.optional(),
  })),
  withdrawalController.listWithdrawals.bind(withdrawalController)
);

router.post(
  '/:withdrawalId/cancel',
  validateParams(GetTransactionSchema),
  validateBody(GetTransactionSchema.extend({
    reason: GetTransactionSchema.shape.reference.optional(),
  })),
  withdrawalController.cancelWithdrawal.bind(withdrawalController)
);

router.get(
  '/user/:userId/stats',
  validateParams(GetTransactionSchema.extend({
    userId: GetTransactionSchema.shape.reference,
  })),
  validateQuery(PaginationSchema.extend({
    startDate: GetTransactionSchema.shape.reference.optional(),
    endDate: GetTransactionSchema.shape.reference.optional(),
  })),
  withdrawalController.getWithdrawalStats.bind(withdrawalController)
);

export default router;
