import type { Request, Response, NextFunction } from "express";
import { registrationUser, type RegisterInput } from "./auth.validation.js";
import {
  registerUser,
  UserNameAlreadyExist,
  EmailExistance,
  DefaultRoleNotFound,
  loginUser,
  WrongCrendential,
} from "./auth.service.js";

export async function register(
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
    const registered_user = await registerUser(validationResults.data);


    res.status(201).json({
      success: true,
      message: "User registred successfully",
      data: registered_user,
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
    if (error instanceof EmailExistance) {
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

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {

  try {
    const logged_user = await loginUser(req.body);

    console.log(logged_user)
    res.status(200).json({
      success: true,
      message: "login successfully",
      data: logged_user
    })

  } catch (error: unknown) {
    if (error instanceof EmailExistance) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof WrongCrendential) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    next(error)
  }
}
