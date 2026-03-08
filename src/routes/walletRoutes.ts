import { Router } from 'express';
import { walletController } from '../controllers/walletController';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { 
  CreateWalletSchema, 
  GetWalletSchema, 
  PaginationSchema 
} from '../types/validation';
import { idempotencyProtection } from '../middleware/idempotency';

const router = Router();

// Wallet routes
router.post(
  '/',
  validateBody(CreateWalletSchema),
  idempotencyProtection(),
  walletController.createWallet.bind(walletController)
);

router.get(
  '/:userId',
  validateParams(GetWalletSchema),
  walletController.getWallet.bind(walletController)
);

router.get(
  '/:userId/balance',
  validateParams(GetWalletSchema),
  walletController.getWalletBalance.bind(walletController)
);

router.get(
  '/:userId/ledger',
  validateParams(GetWalletSchema),
  validateQuery(PaginationSchema),
  walletController.getLedgerEntries.bind(walletController)
);

router.post(
  '/:userId/lock-funds',
  validateParams(GetWalletSchema),
  validateBody(CreateWalletSchema.extend({
    amount: CreateWalletSchema.shape.userId,
    description: CreateWalletSchema.shape.currency.optional(),
  })),
  walletController.lockFunds.bind(walletController)
);

router.post(
  '/:userId/unlock-funds',
  validateParams(GetWalletSchema),
  validateBody(CreateWalletSchema.extend({
    amount: CreateWalletSchema.shape.userId,
    description: CreateWalletSchema.shape.currency.optional(),
  })),
  walletController.unlockFunds.bind(walletController)
);

export default router;
