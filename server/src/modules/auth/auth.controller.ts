import type { Request, Response, NextFunction } from "express";
import {
  registrationUser,
  loginSchema,
  EmailSchema,
} from "./auth.validation.js";
import {
  registerUser,
  UserNameAlreadyExist,
  UnableToCreateOTP,
  EmailExistance,
  DefaultRoleNotFound,
  loginUser,
  WrongCrendential,
  forgetPassword,
  UserNotFound,
} from "./auth.service.js";

import { AuthEmailAlert } from "../../utils/mail.js";

// the register fucntion used to define the user into the database
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

    const content = `<p> Your account created on RentPe Successfully with the email account <b> "${registered_user.email}" </b>, if that was do you, then you can safely ignore this email, In case <mark> if you didn't know about the new account creation activity, </mark> then contact to our helpline for help. <br/> <br/> </p>`;
    await AuthEmailAlert(
      registered_user.email,
      registered_user.username,
      "New Account Create on RentPe",
      content,
    );

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
    return next(error);
  }
}

// the login function is used retrive user info only if when the user enter correct credential with the user
export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const validationResults = loginSchema.safeParse(req.body);
    if (!validationResults.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResults.error.flatten().fieldErrors,
      });
      return;
    }

    const logged_user = await loginUser(validationResults.data);

    const content = `<p> Our system recieve login request from your email address <b> "${logged_user.email}" </b>, if your do that then you can safely ignore this email, In case <mark> if you didn't know about the login activity, </mark> then reset your password or contact to our helpline for help. <br />        <br/> </p>`;
    await AuthEmailAlert(
      logged_user.email,
      logged_user.username,
      "Login Alert from RentPe",
      content,
    );

    const token: string = logged_user.token;

    res.cookie("token", token, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });

    return res.status(200).json({
      success: true,
      message: "login successfully",
      data: logged_user,
    });
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

    return next(error);
  }
}

export async function forget(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response> {
  const { email } = req.body;
  try {

    
    const validateEmail = EmailSchema.safeParse(req.body);
    
    // verify the email address 
    if (validateEmail.success === false) {
      return res.status(400).json({
        success: false,
        message: "Email Validation failed"
      });
    }

    // send result back to the users 
    const result = await forgetPassword(email);
    return res.status(200).json({
      status: true,
      message: "OTP has sended to the registered email account",
      data: result
    });

  } catch (err) {

    // UserNotFound 
    if(err instanceof UserNotFound){
      return res.status(400).json({
        status: false,
        message: 'user is not found'
      })
    }

    // UnableToCreateOTP
    if(err instanceof UnableToCreateOTP){
      res.status(400).json({
        status: false,
        message: "unable to send otp now try later"
      })
    }

    // the universal error
    return res.status(400).json({
      status: false,
      message: "internal server problem",
      data: null
    })
    
  }
}
