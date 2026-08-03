

import { Router } from "express";
import { 
    register, 
    login,
    forget,
    change
} from "./auth.controller.js";

const router = Router();
router.post("/register", register);
router.post('/login', login);
router.post('/forgetPassword', forget);
router.post('/changePassword', change)

export default router;
