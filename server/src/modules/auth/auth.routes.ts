

import { Router } from "express";
import { 
    register, 
    login,
    forget
} from "./auth.controller.js";

const router = Router();
router.post("/register", register);
router.post('/login', login);
router.post('/forgetpassword', forget);

export default router;
