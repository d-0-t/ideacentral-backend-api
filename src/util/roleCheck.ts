import { Request, Response, NextFunction } from "express";

import UserService from "../services/user";

import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from "../helpers/apiError";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    let user = await UserService.findOneUser(id);
    let error = { error: "You don't have permissions to do this." };
    next(new UnauthorizedError("Unauthorized", error));
    res.json();
  } catch (error) {
    next(new NotFoundError("User not found", error));
  }
};
