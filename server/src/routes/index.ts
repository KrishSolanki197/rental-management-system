


import { Router } from "express";
import authRoutes from '../modules/auth/auth.routes.js';
const mainRouter = Router();

mainRouter.use("/auth", authRoutes);

export default mainRouter;