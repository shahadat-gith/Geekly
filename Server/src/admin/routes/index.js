import { Router } from 'express';
import authRoutes from './authRoutes.js';
import topicRoutes from './topicRoutes.js';
import articleRoutes from './articleRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import aiRoutes from './aiRoutes.js';
import mediaRoutes from './mediaRoutes.js';

// Everything under /api/admin. Admin routes never import client routes, so
// the two surfaces can evolve (and be protected) independently.
const router = Router();

router.use('/auth', authRoutes);
router.use('/topics', topicRoutes);
router.use('/articles', articleRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);
router.use('/media', mediaRoutes);

// Backwards-compatible aliases for the original admin login endpoints.
router.use(authRoutes);

export default router;
