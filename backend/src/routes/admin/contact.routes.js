import { Router } from 'express';
import { adminListContacts, adminDeleteContact } from '../../controllers/contact.controller.js';

const router = Router();

router.get('/', adminListContacts);
router.delete('/:id', adminDeleteContact);

export default router;
