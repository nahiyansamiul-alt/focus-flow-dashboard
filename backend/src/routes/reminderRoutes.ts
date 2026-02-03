import { Router } from 'express';
import { 
  getReminders, 
  getRemindersByDate, 
  createReminder, 
  updateReminder, 
  deleteReminder 
} from '../controllers/reminderController';

const router = Router();

router.get('/', getReminders);
router.post('/', createReminder);
router.get('/date/:date', getRemindersByDate);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

export default router;
