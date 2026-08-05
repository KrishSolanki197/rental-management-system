
import jwt from "jsonwebtoken";

import type {
    Request,
    Response,
    NextFunction
} from 'express';
import { success } from 'zod';
import { verify } from "node:crypto";
import { verifyToken } from "../utils/token.js";

export async function authMiddleware(
    req:Request,
    res: Response,
    next: NextFunction
): Promise<void>{

    try {
        const token =  req.cookies.token;
        if(!token){
            res.status(401).json({
                success: false,
                message: "the JWT token is not found"
            });
            return;
        }

        const decode = verifyToken(token);
        req.user = decode;
        next();
    }catch(error){
        res.status(400).json({
            success: false,
            message: "internal server error"
        });
        return;
    }
}
