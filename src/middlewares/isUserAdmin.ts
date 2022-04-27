import { Request, Response, NextFunction } from "express";

export interface GetUserAuthInfoRequest extends Request {
  user?: any;
}

export const isUserAdmin = async (
  req: GetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.login.admin) {
    if (req.user._id.toString() === req.user.login?.email)
      return res.status(401).json({
        message:
          "Unauthorized. This operation requires admin role, which you do have, but you are a deleted user.",
      });
    if (req.user.login.banned)
      return res.status(401).json({
        message:
          "Unauthorized. This operation requires admin role, which you do have, but you are banned.",
      });

    return next();
  }

  return res.status(401).json({
    message: "Unauthorized. This operation requires admin role.",
  });
};
