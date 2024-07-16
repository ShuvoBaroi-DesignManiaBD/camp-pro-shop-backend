import { Router } from 'express';
import { UserRoutes } from '../module/User/user.route';
import { authRoutes } from '../module/auth/auth.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  }, 
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));  // This will automatically loop routes that added in the moduleRoutes array

export default router;