

import type { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  res.status(200).send("Hello from the controller");
};

export const login = async (req: Request, res: Response) => {
  res.status(200).send("Hello this is login API endpoint");
};