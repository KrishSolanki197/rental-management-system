// json web token
import jwt from "jsonwebtoken";
import "dotenv/config";

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

// This is interface to define type of the payload given to the generateJWT function
interface userPayload {
  user_id: string;
  username: string;
  email: string;
}

const secret: string | undefined = process.env.JWT_SECRET_KEY;

// To genarate new token
export function generateToken(
  user_id: string,
  username: string,
  email: string,
): string {

  // user payload type checking
  const payload: userPayload = {
    user_id,
    username,
    email,
  };null

  if (secret == undefined) {
    throw new SecretNotFound();
  }

  const token: string | undefined = jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
  if (token === undefined) {
    throw new TokenNotCreate();
  }
  return token;
}

export function verifyToken(token: string): userPayload {
    if (secret === undefined) {
      throw new SecretNotFound("Token is expired");
    }
    return jwt.verify(token, secret) as userPayload;
}


