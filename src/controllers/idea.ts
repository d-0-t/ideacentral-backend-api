import { Request, Response, NextFunction } from "express";
import Idea from "../models/Idea";
import Tag from "../models/Tag";
import IdeaService from "../services/idea";
import UserService from "../services/user";
import TagService from "../services/tag";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../helpers/apiError";
import { eliminateRepeats, inputObjectCheck } from "../helpers/inputCheck";

export const createIdea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { author, title, description, tags, published, anonymous } = req.body;

  let inputCheck = inputObjectCheck(req.body);
  if (inputCheck) return res.status(400).json({ error: inputCheck });

  if (tags === undefined) tags = ["no tags"];

  //eliminate repeats and "" empty tags
  tags = eliminateRepeats(tags);
  if (tags.length > 5)
    return res
      .status(400)
      .json({ error: "Too many tags. The maximum allowed tags are 5." });

  const newIdea = new Idea({
    author,
    title,
    description,
    tags,
    published,
    anonymous,
  });

  try {
    const user = await UserService.findOneUserUnpopulated(author);
    if (!user)
      return res.status(400).json({ error: "User (author) not found" });

    const idea: any = await IdeaService.createIdea(newIdea);

    if (idea) {
      tags.forEach(async (tag: string) => {
        let doesTagExist: any = await TagService.findTagByTitle(tag);
        if (doesTagExist) {
          await TagService.updateTag(tag, 1);
          await TagService.addIdeaToTag(tag, idea._id);
        } else {
          let newTag = new Tag({
            title: tag,
            count: 1,
            ideas: [idea._id],
          });
          await TagService.createTag(newTag);
        }
      });
      await UserService.addIdeaToUser(author, idea._id);
      return res.json(idea);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return next(new BadRequestError("Invalid Request", error));
    } else {
      return next(new InternalServerError("Internal Server Error", error));
    }
  }
};

export const findAllIdeas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json(await IdeaService.findAllIdeas());
  } catch (error) {
    return next(new NotFoundError("Ideas not found", error));
  }
};

export const findAllPublishedIdeas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let ideas = await IdeaService.findAllPublishedIdeas();
    let anonimizedIdeas: any = [];
    //@ts-ignore
    if (ideas && req.user?.login.admin === false) {
      ideas.forEach((original) => {
        let corrected = { ...original.toJSON() };
        //@ts-ignore
        //idea = idea.toJSON();
        if (
          original?.anonymous && //@ts-ignore
          original?.author?._id && //@ts-ignore
          original.author._id.toString() !== req.user?._id.toString()
        ) {
          //@ts-ignore
          corrected.author.login.username = "Anonymous";
          //@ts-ignore
          corrected.author._id = "hidden";
        }
        anonimizedIdeas.push(corrected);
      });
      return res.json(anonimizedIdeas);
    }
    return res.json(ideas);
  } catch (error) {
    return next(new NotFoundError("Published ideas not found", error));
  }
};

export const findIdeaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    let idea = (await IdeaService.findIdeaById(id))?.toJSON();
    //@ts-ignore
    if (idea && req.user?.login.admin === false) {
      if (
        idea?.anonymous && //@ts-ignore
        idea?.author?._id && //@ts-ignore
        idea.author._id.toString() !== req.user?._id.toString()
      ) {
        //@ts-ignore
        idea.author.login.username = "Anonymous"; //@ts-ignore
        idea.author._id = "hidden";
      }
    }
    return res.json(idea);
  } catch (error) {
    return next(new NotFoundError("Idea not found", error));
  }
};

export const updateIdea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  let data = req.body;

  // these should not be modified by this function:
  if (data?.author) delete data.author;
  if (data?.comments) delete data.comments;
  if (data?.stats) delete data.stats;

  let inputCheck = inputObjectCheck(data);
  if (inputCheck) return res.status(400).json({ error: inputCheck });

  // handle updating tags
  try {
    if (data.tags) {
      const oldIdea = await IdeaService.findIdeaByIdUnpopulated(id);
      if (oldIdea) {
        let oldTags = oldIdea.tags;
        let newTags = eliminateRepeats(data.tags);
        if (newTags.length > 5)
          return res
            .status(400)
            .json({ error: "Too many tags. The maximum allowed tags are 5." });

        // assign tags to the new array!
        data.tags = newTags;

        // create new tags if they are not in db
        // if they are in db, increase count
        for (let i = 0; i < newTags.length; i++) {
          let tag = newTags[i];
          if (!oldTags.includes(tag)) {
            let doesTagExist: any = await TagService.findTagByTitle(tag);
            if (doesTagExist) {
              await TagService.updateTag(tag, 1);
              await TagService.addIdeaToTag(tag, id);
            } else {
              let newTag = new Tag({
                title: tag,
                count: 1,
                ideas: [id],
              });
              await TagService.createTag(newTag);
            }
          }
        }
        // decrease old tags' counts if they are not present in the new tags
        for (let i = 0; i < oldTags.length; i++) {
          let tag = oldTags[i];
          if (!newTags.includes(tag)) {
            let doesTagExist: any = await TagService.findTagByTitle(tag);
            if (doesTagExist) {
              let updatedTag = await TagService.updateTag(tag, -1);
              await TagService.removeIdeaFromTag(tag, id);
              if (updatedTag && updatedTag.count < 1) {
                await TagService.deleteTag(tag);
              }
            }
          }
        }
      }
    }
    return res.json(await IdeaService.updateIdea(id, data));
  } catch (error) {
    return next(new NotFoundError("Idea not found", error));
  }
};

export const deleteIdea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;

  try {
    const idea = await IdeaService.deleteIdea(id);
    if (idea) {
      // remove idea from user and correct their power levels
      await UserService.removeIdeaFromUser(idea.author, id);
      let powerChange: number =
        idea.stats.downvotes.count -
        idea.stats.upvotes.count -
        idea.stats.favorites.count * 10;
      await UserService.powerUpdate(idea.author, powerChange);

      // remove idea from other users' interactions
      idea.stats.favorites.users.forEach(async (userId: string) => {
        await UserService.removeFavoriteIdeaFromUser(userId, id);
      });
      idea.stats.upvotes.users.forEach(async (userId: string) => {
        await UserService.removeUpvoteFromUser(userId, id);
      });
      idea.stats.downvotes.users.forEach(async (userId: string) => {
        await UserService.removeDownvoteFromUser(userId, id);
      });

      // update tags of idea
      // if no ideas in tag, delete tag
      idea.tags.forEach(async (tag: string) => {
        let updatedTag = await TagService.updateTag(tag, -1);
        await TagService.removeIdeaFromTag(tag, id);
        if (updatedTag && updatedTag?.count < 1) {
          await TagService.deleteTag(tag);
        }
      });
    }
    // return deleted idea
    return res.json(idea);
  } catch (error) {
    return next(new NotFoundError("Idea not found", error));
  }
};

export const addFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { ideaId, userId } = req.params;
  try {
    const ideaCheck = await IdeaService.findIdeaByIdUnpopulated(ideaId);

    if (!ideaCheck) return res.status(400).json({ error: "Idea not found." });
    let userCheck = await UserService.findOneUserUnpopulated(userId);
    if (!userCheck) return res.status(400).json({ error: "User not found." });

    if (ideaCheck.stats.favorites.users.includes(userId)) {
      let error: any = { error: "Idea is already in your favorites." };
      return next(new BadRequestError("Invalid Request", error));
    }
    if (ideaCheck.author.toString() !== userId) {
      const idea = await IdeaService.addUserToFavorites(ideaId, userId);
      if (idea) {
        await UserService.addFavoriteIdeaToUser(userId, ideaId);
        await UserService.powerUpdate(idea.author, 10);
        return res.json(idea);
      }
    } else {
      return res
        .status(400)
        .json({ error: "You can't favorite your own idea." });
    }
  } catch (error) {
    return next(new NotFoundError("Idea not found", error));
  }
};

export const removeFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { ideaId, userId } = req.params;
  try {
    const idea = await IdeaService.removeUserFromFavorites(ideaId, userId);
    if (idea) {
      await UserService.removeFavoriteIdeaFromUser(userId, ideaId);
      await UserService.powerUpdate(idea.author, -10);
      return res.json(idea);
    }
  } catch (error) {
    return next(new NotFoundError("Idea not found", error));
  }
};

export const upvoteIdea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { ideaId, userId } = req.params;
  try {
    const ideaCheck = await IdeaService.findIdeaByIdUnpopulated(ideaId);
    if (!ideaCheck) return res.status(400).json({ error: "Idea not found." });
    let userCheck = await UserService.findOneUserUnpopulated(userId);
    if (!userCheck) return res.status(400).json({ error: "User not found." });

    if (ideaCheck.stats.upvotes.users.includes(userId)) {
      let error: any = { error: "Idea is already upvoted by this user." };
      return next(new BadRequestError("Invalid Request", error));
    }
    if (ideaCheck.author.toString() === userId) {
      let error: any = { error: "You can't upvote your own idea." };
      return next(new BadRequestError("Invalid Request", error));
    }

    const idea = await IdeaService.addUserToUpvotes(ideaId, userId);
    if (idea) {
      await UserService.addUpvoteToUser(userId, ideaId);
      let isItDownvoted: boolean = idea.stats.downvotes.users.includes(userId);
      if (isItDownvoted) {
        await UserService.powerUpdate(idea.author, 2);
        await UserService.removeDownvoteFromUser(userId, ideaId);
        let newIdea = await IdeaService.removeUserFromDownvotes(ideaId, userId);
        return res.json(newIdea);
      } else {
        await UserService.powerUpdate(idea.author, 1);
        return res.json(idea);
      }
    }
  } catch (error) {
    return next(new NotFoundError("Idea not found", error));
  }
};

export const removeUpvoteFromIdea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { ideaId, userId } = req.params;
  try {
    const voteCheck = await IdeaService.findIdeaByIdUnpopulated(ideaId);
    if (!voteCheck?.stats.upvotes.users.includes(userId)) {
      let error: any = { error: "The idea was not upvoted by this user." };
      return next(new BadRequestError("Invalid Request", error));
    }

    let idea = await IdeaService.removeUserFromUpvotes(ideaId, userId);
    if (idea) {
      await UserService.powerUpdate(idea.author, -1);
      await UserService.removeUpvoteFromUser(userId, ideaId);
    }
    return res.json(idea);
  } catch (error) {
    return next(new NotFoundError("Idea not found", error));
  }
};

export const downvoteIdea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { ideaId, userId } = req.params;
  try {
    const ideaCheck = await IdeaService.findIdeaByIdUnpopulated(ideaId);
    if (!ideaCheck) return res.status(400).json({ error: "Idea not found." });
    let userCheck = await UserService.findOneUserUnpopulated(userId);
    if (!userCheck) return res.status(400).json({ error: "User not found." });

    if (ideaCheck.stats.downvotes.users.includes(userId)) {
      let error: any = { error: "Idea is already downvoted by you." };
      return next(new BadRequestError("Invalid Request", error));
    }
    if (ideaCheck.author.toString() === userId) {
      let error: any = { error: "You can't downvote your own idea." };
      return next(new BadRequestError("Invalid Request", error));
    }

    const idea = await IdeaService.addUserToDownvotes(ideaId, userId);
    if (idea) {
      await UserService.addDownvoteToUser(userId, ideaId);

      let isItUpvoted: boolean = idea.stats.upvotes.users.includes(userId);
      if (isItUpvoted) {
        await UserService.powerUpdate(idea.author, -2);
        await UserService.removeUpvoteFromUser(userId, ideaId);
        let newIdea = await IdeaService.removeUserFromUpvotes(ideaId, userId);
        return res.json(newIdea);
      } else {
        await UserService.powerUpdate(idea.author, -1);
        return res.json(idea);
      }
    }
  } catch (error) {
    return next(new NotFoundError("Idea not found", error));
  }
};

export const removeDownvoteFromIdea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { ideaId, userId } = req.params;
  try {
    const voteCheck = await IdeaService.findIdeaByIdUnpopulated(ideaId);
    if (!voteCheck?.stats.downvotes.users.includes(userId)) {
      let error: any = { error: "Idea was not downvoted by you." };
      return next(new BadRequestError("Invalid Request", error));
    }

    let idea = await IdeaService.removeUserFromDownvotes(ideaId, userId);
    if (idea) {
      await UserService.powerUpdate(idea.author, 1);
      await UserService.removeDownvoteFromUser(userId, ideaId);
    }
    return res.json(idea);
  } catch (error) {
    return next(new NotFoundError("Idea not found", error));
  }
};
