import { Request, Response, NextFunction } from "express";
import Tag from "../models/Tag";
import TagService from "../services/tag";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../helpers/apiError";
import { inputObjectCheck } from "../helpers/inputCheck";

export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { title } = req.body;

    let inputCheck = inputObjectCheck(req.body);
    if (inputCheck) return res.status(400).json({ error: inputCheck });

    const doesNameExist = await TagService.findTagByTitle(title);
    if (doesNameExist) return res.status(400).json(doesNameExist);

    const newTag = new Tag({ title });

    const tag: any = await TagService.createTag(newTag);
    return res.json(tag);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return next(new BadRequestError("Invalid Request", error));
    } else {
      return next(new InternalServerError("Internal Server Error", error));
    }
  }
};

export const findAllTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json(await TagService.findAllTags());
  } catch (error) {
    return next(new NotFoundError("Tags not found", error));
  }
};

export const findAllTagsWithPublishedIdeas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json(await TagService.findAllTagsWithPublishedIdeas());
  } catch (error) {
    return next(new NotFoundError("Tags not found", error));
  }
};

export const findTagByTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { title } = req.params;
  title = title.toLowerCase();
  try {
    return res.json(await TagService.findTagByTitle(title));
  } catch (error) {
    return next(new NotFoundError("Tag not found", error));
  }
};

export const findTagByTitleWithPublishedIdeas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { title } = req.params;
  title = title.toLowerCase();
  try {
    return res.json(await TagService.findTagByTitleWithPublishedIdeas(title));
  } catch (error) {
    return next(new NotFoundError("Tag not found", error));
  }
};

export const deleteTagById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    return res.json(await TagService.deleteTagById(id));
  } catch (error) {
    return next(new NotFoundError("Tag not found", error));
  }
};
