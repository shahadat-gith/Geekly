import { Router } from 'express';
import { authenticateAdmin } from '../middlewares/auth.js';
import { uploadErrorHandler, uploadSingleImage } from '../middlewares/upload.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { list, get, create, update, remove } from '../controllers/articleController.js';
import {
  generateDiagramImage,
  getDiagram,
  listDiagrams,
  uploadDiagramImage,
} from '../controllers/diagramController.js';

const router = Router();

router.use(authenticateAdmin);

router.get('/', asyncHandler(list));
router.get('/:id', asyncHandler(get));
router.post('/', asyncHandler(create));
router.patch('/:id', asyncHandler(update));
router.delete('/:id', asyncHandler(remove));

router.get('/:id/diagrams', asyncHandler(listDiagrams));
router.get('/:id/diagrams/:diagramId', asyncHandler(getDiagram));
router.post('/:id/diagrams/:diagramId/generate', asyncHandler(generateDiagramImage));
router.post(
  '/:id/diagrams/:diagramId/image',
  uploadSingleImage,
  asyncHandler(uploadDiagramImage),
);

router.use(uploadErrorHandler);

export default router;
