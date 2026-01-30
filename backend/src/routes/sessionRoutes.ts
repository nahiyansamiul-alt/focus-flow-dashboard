import { Router } from 'express';
import { getSessions, createSession } from '../controllers/sessionController';

const router = Router();

router.get('/', getSessions);
router.post('/', createSession);

export default router;
