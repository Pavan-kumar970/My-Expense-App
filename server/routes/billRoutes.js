import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { listBills, createBill, updateBill, deleteBill } from '../controllers/billController.js';

const router = Router();

router.use(authenticate);
router.get('/', listBills);
router.post('/', createBill);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);

export default router;
