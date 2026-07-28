
import type { Request, Response } from "express";
import * as authService from './auth.service.js';
import type { RegisterUserInput } from "../../types/User.js";

export const register = async (req: Request, res: Response): Promise<void>  => {

  const { username, firstname, lastname, phone, email, password } = req.body;

  const payload:RegisterUserInput = { 
    username: username.toLowerCase().trim(), 
    firstname: firstname.toLowerCase().trim(), 
    lastname: lastname.trim().toLowerCase(), 
    phone: phone.trim(), 
    email: email.trim().toLowerCase(), 
    password: password.toLowerCase().trim() 
  };

  const result = await authService.registerUser(payload);


  res.status(200).send(result);
};

export const login = async (req: Request, res: Response) => {
  res.status(200).send("Hello this is login API endpoint");
};
