import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';

const router = Router();

router.use(authenticate);
router.get('/', listExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.patch('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
