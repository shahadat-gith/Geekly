import { Router } from 'express';
import authRoutes from './auth/routes.js';
import topicRoutes from './topics/routes.js';
import articleRoutes from './articles/routes.js';
import dashboardRoutes from './dashboard/routes.js';
import aiRoutes from './ai/routes.js';
import mediaRoutes from './media/routes.js';

// Everything under /api/admin. Admin routes never import public routes, so the
// two surfaces can evolve (and be protected) independently.
const router = Router();

router.use('/auth', authRoutes);
router.use('/topics', topicRoutes);
router.use('/articles', articleRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);
router.use('/media', mediaRoutes);

export default router;
