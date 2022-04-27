import { Request, Response, NextFunction } from "express";
import Comment from "../models/Comment";
import CommentService from "../services/comment";
import IdeaService from "../services/idea";
import UserService from "../services/user";

import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../helpers/apiError";
import { inputObjectCheck } from "../helpers/inputCheck";

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { author, idea, comment } = req.body;

    let inputCheck = inputObjectCheck(req.body);
    if (inputCheck) return res.status(400).json({ error: inputCheck });

    let ideaCheck = await IdeaService.findIdeaById(idea);
    if (!ideaCheck)
      return res.status(400).json({ error: "Idea doesn't exist." });

    let userCheck = await UserService.findOneUser(author);
    if (!userCheck)
      return res.status(400).json({ error: "User doesn't exist." });

    const newComment = new Comment({ author, idea, comment });
    const newCommentResponse: any = await CommentService.createComment(
      newComment
    );
    if (newCommentResponse) {
      await UserService.addCommentToUser(author, newCommentResponse._id);
      await IdeaService.addCommentToIdea(idea, newCommentResponse._id);
    }
    return res.json(newCommentResponse);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return next(new BadRequestError("Invalid Request", error));
    } else {
      return next(new InternalServerError("Internal Server Error", error));
    }
  }
};

export const findAllComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json(await CommentService.findAllComments());
  } catch (error) {
    return next(new NotFoundError("Comments not found", error));
  }
};

export const findCommentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    return res.json(await CommentService.findCommentById(id));
  } catch (error) {
    return next(new NotFoundError("Comment not found", error));
  }
};

export const findCommentsByIdea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { ideaId } = req.params;

  try {
    return res.json(await CommentService.findCommentsByIdea(ideaId));
  } catch (error) {
    return next(new NotFoundError("Comments not found", error));
  }
};

export const findCommentsByAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { userId } = req.params;

  try {
    return res.json(await CommentService.findCommentsByAuthor(userId));
  } catch (error) {
    return next(new NotFoundError("Comments not found", error));
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  let { comment } = req.body;
  let commentObject = { comment };
  let inputCheck = inputObjectCheck(commentObject);
  if (inputCheck) return res.status(400).json({ error: inputCheck });

  try {
    return res.json(await CommentService.updateComment(id, comment));
  } catch (error) {
    return next(new NotFoundError("Comment not found", error));
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    const comment = await CommentService.deleteComment(id);
    if (comment) {
      await UserService.removeCommentFromUser(comment.author, id);
      await IdeaService.removeCommentFromIdea(comment.idea, id);
      return res.json(comment);
    }
  } catch (error) {
    return next(new NotFoundError("Comment not found", error));
  }
};
