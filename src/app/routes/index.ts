import { Router } from "express";
import { userRoutes } from "../module/User/user.route";
import { authRoutes } from "../module/auth/auth.route";
import { productRoutes } from "../module/Product/product.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/products",
    route: productRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route)); // This will automatically loop routes that added in the moduleRoutes array

export default router;
