

import { Router } from "express";
import { 
    register, 
    login,
    forget,
    change
} from "./auth.controller.js";

import { 
    authMiddleware 
} from "../../middlewares/authMiddlewares.js";

const router = Router();

router.post("/register", register);
router.post('/login', login);
router.post('/forgetPassword', forget);
router.post('/changePassword', authMiddleware, change);

export default router;