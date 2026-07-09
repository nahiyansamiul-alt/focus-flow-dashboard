import { Router } from 'express';
import { getHistory, getActivityHistory, getHistoryByDate, createHistory } from '../controllers/historyController';

const router = Router();

router.get('/', getHistory);
router.get('/activity', getActivityHistory);
router.get('/:date', getHistoryByDate);
router.post('/', createHistory);

export default router;
