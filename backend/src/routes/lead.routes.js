import { Router } from 'express';
import { createLead } from '../controllers/contact.controller.js';

const router = Router();

router.post('/', createLead);

export default router;
