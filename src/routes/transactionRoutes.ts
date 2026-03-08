import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { 
  InitializeTransactionSchema, 
  GetTransactionSchema, 
  ListTransactionsSchema,
  PaginationSchema 
} from '../types/validation';
import { idempotencyProtection } from '../middleware/idempotency';

const router = Router();

// Transaction routes
router.post(
  '/',
  validateBody(InitializeTransactionSchema),
  idempotencyProtection(),
  transactionController.initializeTransaction.bind(transactionController)
);

router.post(
  '/:reference/process',
  validateParams(GetTransactionSchema),
  validateBody(GetTransactionSchema.extend({
    providerRef: GetTransactionSchema.shape.reference.optional(),
    metadata: GetTransactionSchema.shape.reference.optional(),
  })),
  transactionController.processTransaction.bind(transactionController)
);

router.get(
  '/:reference',
  validateParams(GetTransactionSchema),
  transactionController.getTransaction.bind(transactionController)
);

router.get(
  '/user/:userId',
  validateParams(GetTransactionSchema.extend({
    userId: GetTransactionSchema.shape.reference,
  })),
  validateQuery(ListTransactionsSchema),
  transactionController.listTransactions.bind(transactionController)
);

router.post(
  '/:reference/fail',
  validateParams(GetTransactionSchema),
  validateBody(GetTransactionSchema.extend({
    reason: GetTransactionSchema.shape.reference.optional(),
  })),
  transactionController.failTransaction.bind(transactionController)
);

router.post(
  '/:reference/reverse',
  validateParams(GetTransactionSchema),
  validateBody(GetTransactionSchema.extend({
    reason: GetTransactionSchema.shape.reference.optional(),
  })),
  transactionController.reverseTransaction.bind(transactionController)
);

router.get(
  '/:reference/fraud-score',
  validateParams(GetTransactionSchema),
  transactionController.getTransactionFraudScore.bind(transactionController)
);

export default router;
