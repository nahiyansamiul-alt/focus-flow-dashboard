import { Router } from 'express';
import { getFolders, createFolder } from '../controllers/folderController';

const router = Router();

router.get('/', getFolders);
router.post('/', createFolder);

export default router;
