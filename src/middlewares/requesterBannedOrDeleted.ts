import { Request, Response, NextFunction } from "express";

export interface GetUserAuthInfoRequest extends Request {
  user?: any;
}

export const requesterBannedOrDeleted = async (
  req: GetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.login.banned)
    return res.status(400).json({
      message: "Unauthorized. You are banned.",
    });

  if (req.user?.login.email === req.user._id.toString())
    return res.status(400).json({
      message: "Unauthorized - you're a deleted user.",
    });

  return next();
};
