import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../public/middleware/authenticate.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { createRateLimiter } from '../../shared/rateLimit.js';
import * as hosting from './hosting.controller.js';
import { HOSTING_LIMITS } from './validate.js';

const router = Router();
router.use(authenticate);

// One file per request keeps memory bounded: the buffer lives only for that
// request and goes straight to R2.
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: HOSTING_LIMITS.maxFileBytes, files: 1 },
}).single('file');

const hourly = (max, message) => createRateLimiter({ windowMs: 60 * 60 * 1000, max, message });
const minute = (max, message) => createRateLimiter({ windowMs: 60 * 1000, max, message });

const projectLimit = hourly(20, 'You have created several sites this hour. Try again later.');
const deployLimit = hourly(30, 'You have started many deployments this hour. Try again later.');
const fileLimit = minute(600, 'Too many file uploads. Slow down and try again.');
const slugLimit = minute(60, 'Too many address checks. Try again in a minute.');
const mutateLimit = minute(60, 'Too many changes. Try again in a minute.');

router.get('/check-slug/:slug', slugLimit, asyncHandler(hosting.checkSlug));
router.post('/projects', projectLimit, asyncHandler(hosting.createProject));
router.get('/projects', asyncHandler(hosting.listProjects));
router.get('/projects/:projectId', asyncHandler(hosting.getProject));
router.patch('/projects/:projectId', mutateLimit, asyncHandler(hosting.updateProject));
router.delete('/projects/:projectId', mutateLimit, asyncHandler(hosting.deleteProject));

router.get('/projects/:projectId/deployments', asyncHandler(hosting.listDeployments));
router.post('/projects/:projectId/deployments', deployLimit, asyncHandler(hosting.createDeployment));

router.get('/:deploymentId', asyncHandler(hosting.getDeployment));
router.put('/:deploymentId/files', fileLimit, fileUpload, asyncHandler(hosting.uploadFile));
router.post('/:deploymentId/finalize', deployLimit, asyncHandler(hosting.finalize));
router.post('/:deploymentId/retry', deployLimit, asyncHandler(hosting.retry));
router.post('/:deploymentId/rollback', mutateLimit, asyncHandler(hosting.rollback));

export default router;
