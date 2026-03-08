import { Router } from 'express'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'LedgerFlow API Running' })
})

export default router