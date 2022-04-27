import { Request, Response, NextFunction } from "express";

import UserService from "../services/user";
import CommentService from "../services/comment";
import IdeaService from "../services/idea";

export interface GetUserAuthInfoRequest extends Request {
  user?: any;
}

const msg: any = {
  deletedUser: "Unauthorized - you're trying to modify a deleted user.",
  insuffPerm: "Unauthorized. Insufficient permissions.",
  something: "Something went wrong.",
  notfound: "Content not found.",
};

export class IsUserRelevant {
  static async requesterMatches(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { userId } = req.params;
    let { _id } = req.user;

    if (userId.toString() === _id.toString()) return next();
    return res.status(401).json({ message: msg.insuffPerm });
  }

  //USER

  static async follow(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { theirUnfollower, theirFollower } = req.params;
    let userCheck = theirFollower ? theirFollower : theirUnfollower;
    if (req.user?._id.toString() === userCheck.toString()) return next();

    return res.status(401).json({ message: msg.insuffPerm });
  }

  static async matchingUserOrAdmin(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { userId, id } = req.params;
    let checkId = userId
      ? userId
      : id
      ? id
      : req.user?._id
      ? req.user?._id
      : null;

    if (req.user?.login.admin) return next();
    if (req.user?._id.toString() === checkId.toString()) return next();

    return res.status(401).json({ message: msg.insuffPerm });
  }

  static async isTargetedUserDeleted(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { userId, id } = req.params;
    let checkId = userId
      ? userId
      : id
      ? id
      : req.user?._id
      ? req.user?._id
      : null;
    checkId = checkId.toString();
    if (checkId) {
      try {
        let user = await UserService.findOneUser(checkId);
        if (user && checkId) {
          if (user.login.email !== user._id.toString()) return next();

          return res.status(401).json({
            message: msg.deletedUser,
          });
        }
      } catch (error) {
        let errorMessage = { message: msg.something, error: error };
        return res.status(400).json(errorMessage);
      }
    }
    let errorMessage = { message: msg.something };
    return res.status(400).json(errorMessage);
  }

  //REPORTING

  static async requesterMatchesReporter(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { by } = req.body;
    let { _id } = req.user;

    if (by.toString() === _id.toString()) return next();
    return res.status(401).json({ message: msg.insuffPerm });
  }

  //COMMENTING

  static async requesterMatchesAuthor(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { author } = req.body;
    let { _id } = req.user;

    if (author.toString() === _id.toString()) return next();
    return res.status(401).json({ message: msg.insuffPerm });
  }

  static async commentAuthor(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { id } = req.params;
    try {
      let comment = await CommentService.findCommentById(id);
      if (!comment) return res.status(404).json({ message: msg.notfound });
      if (comment.author.toString() === req.user?._id.toString()) return next();
    } catch (error) {
      let errorMessage = { message: msg.something, error: error };
      return res.status(400).json(errorMessage);
    }
    return res.status(401).json({ message: msg.insuffPerm });
  }

  static async commentAuthorOrAdmin(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    if (req.user?.login.admin) return next();

    let { id } = req.params;
    try {
      let comment = await CommentService.findCommentById(id);
      if (!comment) return res.status(404).json({ message: msg.notfound });
      if (comment.author.toString() === req.user?._id.toString()) return next();
    } catch (error) {
      let errorMessage = { message: msg.something, error: error };
      return res.status(400).json(errorMessage);
    }
    return res.status(401).json({ message: msg.insuffPerm });
  }

  //MESSAGING

  static async requesterMatchesSender(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { sender } = req.body;
    let { _id } = req.user;

    if (sender.toString() === _id.toString()) return next();
    return res.status(401).json({ message: msg.insuffPerm });
  }

  static async recipientDeletedOrBanned(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { recipient } = req.body;
    try {
      let user = await UserService.findOneUser(recipient);
      if (!user)
        return res
          .status(400)
          .json({ message: "Addressed user doesn't exist" });

      if (user?.login?.email === user?._id.toString()) {
        let errorMessage = { message: "Addressed user was deleted." };
        return res.status(400).json(errorMessage);
      }
      if (user?.login?.banned) {
        let errorMessage = { message: "Addressed user is banned." };
        return res.status(400).json(errorMessage);
      }
      return next();
    } catch (error) {
      let errorMessage = { message: msg.something, error: error };
      return res.status(400).json(errorMessage);
    }
  }

  //IDEAS

  static async ideaIdRequestAccessValidation(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    if (req.user?.login.admin) return next();

    let { id } = req.params;
    try {
      let idea = await IdeaService.findIdeaById(id);
      if (!idea) return res.status(404).json({ message: msg.notfound });
      if (idea.author.toString() === req.user?._id.toString()) return next();
      if (idea.published) return next();
    } catch (error) {
      let errorMessage = { message: msg.something, error: error };
      return res.status(400).json(errorMessage);
    }
    return res.status(401).json({ message: msg.insuffPerm });
  }

  static async ideaAuthor(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    let { id } = req.params;
    try {
      let idea = await IdeaService.findIdeaById(id);
      if (!idea) return res.status(404).json({ message: msg.notfound });
      if (idea.author.toString() === req.user?._id.toString()) return next();
    } catch (error) {
      let errorMessage = { message: msg.something, error: error };
      return res.status(400).json(errorMessage);
    }
    return res.status(401).json({ message: msg.insuffPerm });
  }

  static async ideaAuthorOrAdmin(
    req: GetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    if (req.user?.login.admin) return next();

    let { id } = req.params;
    try {
      let idea = await IdeaService.findIdeaById(id);
      if (!idea) return res.status(404).json({ message: msg.notfound });
      if (idea.author.toString() === req.user?._id.toString()) return next();
    } catch (error) {
      let errorMessage = { message: msg.something, error: error };
      return res.status(400).json(errorMessage);
    }
    return res.status(401).json({ message: msg.insuffPerm });
  }
}
