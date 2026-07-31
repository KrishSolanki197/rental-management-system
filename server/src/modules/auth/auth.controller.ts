import type { Request, Response, NextFunction } from "express";
import { registrationUser } from "./auth.validation.js";
import {
  registerUser,
  UserNameAlreadyExist,
  EmailAlreadyExist,
  DefaultRoleNotFound,
} from "./auth.service.js";
import { success } from "zod";
import { error } from "node:console";

export async function register(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validationResults = registrationUser.safeParse(req.body);

  if (!validationResults.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResults.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const registeredUser = await registerUser(validationResults.data);

    res.status(201).json({
      success: true,
      message: "User registred successfully",
      data: registeredUser,
    });

    res.status(201).json({
      success: true,
    });
  } catch (error: unknown) {
    // username not exits
    if (error instanceof UserNameAlreadyExist) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    // email is not exists
    if (error instanceof EmailAlreadyExist) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    // role not exist
    if (error instanceof DefaultRoleNotFound) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}
