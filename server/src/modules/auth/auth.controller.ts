
import type { Request, Response } from "express";
import * as authService from './auth.service.js';
import type { RegisterUserInput } from "../../types/User.js";
import type { ResponseType } from "../../types/ResponseType.js";

export const register = async (req: Request, res: Response): Promise<void>  => {

  // format the payload before send to the service layer 
  const payload:RegisterUserInput = { 
    username: req.body.username.toLowerCase().trim(), 
    firstname: req.body.firstname.toLowerCase().trim(), 
    lastname: req.body.lastname.trim().toLowerCase(), 
    phone: req.body.phone.trim(), 
    email: req.body.email.trim().toLowerCase(), 
    password: req.body.password.toLowerCase().trim() 
  };

  const result = await authService.registerUser(payload);

  if(result.success){
    res.status(200).send(result)
  }

  res.status(400).send(result);
};

export const login = async (req: Request, res: Response) => {
  res.status(200).send("Hello this is login API endpoint");
};
