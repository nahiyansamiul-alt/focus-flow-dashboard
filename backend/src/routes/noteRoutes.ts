import { Router } from 'express';
import { 
  getNotes, 
  getNotesByFolder,
  createNote, 
  updateNote, 
  deleteNote 
} from '../controllers/noteController';

const router = Router();

router.get('/', getNotes);
router.get('/folder/:folderId', getNotesByFolder);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
