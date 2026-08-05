// json web token
import jwt from "jsonwebtoken";
import "dotenv/config";
import type {AuthUser} from '../types/auth.js';

// Secret Not Found
export class SecretNotFound extends Error {
  constructor(message = "JWT Secret key not found") {
    super(message);
    this.name = "SecretNotFound";
  }
}

export class TokenNotCreate extends Error {
  constructor() {
    super("Token was not generated");
    this.name = "TokenNotCreate";
  }
}

const secret: string | undefined = process.env.JWT_SECRET_KEY;

// To genarate new token
export function generateToken(
  user_id: string,
  username: string,
  email: string,
): string {

  // user payload type checking
  const payload: AuthUser = {
    user_id,
    username,
    email,
  };null

  if (secret == undefined) {
    throw new SecretNotFound();
  }

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
  
} 

export function verifyToken(token: string): AuthUser {
    if (!secret) {
      throw new SecretNotFound("Token is expired");
    }
    return jwt.verify(token, secret) as AuthUser;
}


