import { Router } from 'express';
import {
  listClientLogos,
  createClientLogo,
  updateClientLogo,
  deleteClientLogo,
} from '../../controllers/clientLogo.controller.js';
import { uploadClientLogo } from '../../middleware/upload.js';

const router = Router();

router.get('/', listClientLogos);
router.post('/', uploadClientLogo.single('image'), createClientLogo);
router.put('/:id', uploadClientLogo.single('image'), updateClientLogo);
router.delete('/:id', deleteClientLogo);

export default router;
