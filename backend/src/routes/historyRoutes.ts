import { Router } from 'express';
import { getHistory, getHistoryByDate, createHistory } from '../controllers/historyController';

const router = Router();

router.get('/', getHistory);
router.get('/:date', getHistoryByDate);
router.post('/', createHistory);

export default router;
