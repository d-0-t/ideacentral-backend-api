import { Request, Response, NextFunction } from "express";

export interface GetUserAuthInfoRequest extends Request {
  user?: any;
}

export const isRequestingUserDeleted = async (
  req: GetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.login.email !== req.user._id.toString()) return next();

  return res.status(400).json({
    message: "Unauthorized - you're a deleted user.",
  });
};
