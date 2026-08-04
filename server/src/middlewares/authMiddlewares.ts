import type { users } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { string } from "zod";

declare global {
  namespace Express {
    interface Request {
      user?: users;
    }
  }
}


// not implemented
interface JWTPayload {
    [key: string]: any;
    iat?: number;
    exp?: number;
    iss?: string;
    sub?: string;
}

// This is interface to define type of the payload given to the generateJWT function
interface userPayload extends JWTPayload {
  user_id: string;
  username: string;
  email: string;
}

// for req.user
interface Request{
    user?: users;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | NextFunction> {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const jwt_secret:string | undefined = process.env.JWT_SECRET_KEY;

    if (jwt_secret === undefined) {
        throw new Error("JWT is Not Found");
    }

    const decode = jwt.verify(token, jwt_secret);

    if(typeof decode === "string"){
        throw new Error("Invalid Token found");
    }

    const payload = decode as userPayload;

    req.auth = payload;
    next()

    
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token received",
    });
  }
}
