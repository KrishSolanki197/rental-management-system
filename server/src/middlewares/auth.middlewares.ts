import jwt from "jsonwebtoken";

import type { Request, Response, NextFunction } from "express";
import { SecretNotFound, TokenNotCreate } from "../utils/token.js";
import type { AuthUser } from "../types/auth.js";
import "dotenv/config";
import { emitWarning } from "node:process";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "the JWT token is not found",
      });
      return;
    }

    const secret: string | undefined = process.env.JWT_SECRET_KEY;

    if(!secret){
        throw new SecretNotFound();
    }

    jwt.verify(token, secret, (err:unknown, decode:any): void =>{
        if(err){
            throw new TokenNotCreate("Token not found");
        }

        req.user = decode;
        next();
    });

  } catch (error) {
    if (error instanceof SecretNotFound) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof TokenNotCreate) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Internal Error",
    });
  }
}
