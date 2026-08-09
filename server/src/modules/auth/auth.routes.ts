

import { Router } from "express";
import { 
    register, 
    emailVerification,
    login,
    forget,
    change,
    logout
} from "./auth.controller.js";

import { 
    authMiddleware 
} from "../../middlewares/auth.middlewares.js";

const router = Router();

router.post("/register", register);
router.post('/login', login);
router.post('/forgetPassword', forget);
router.post("/verifyEmail", emailVerification);
router.post('/logout', logout);

router.post('/changePassword', authMiddleware, change);

export default router;