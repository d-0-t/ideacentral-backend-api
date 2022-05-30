import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { LinkType } from "../models/User";
import { JWT_SECRET } from "../util/secrets";
import UserService from "../services/user";
import CommentService from "../services/comment";
import IdeaService from "../services/idea";
import TagService from "../services/tag";
import MessageService from "../services/message";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../helpers/apiError";
import { inputObjectCheck } from "../helpers/inputCheck";
import { mergeDeepWithArrayOverwrite } from "../helpers/deepMerge";
import defaultUser from "../helpers/defaultUser";
import { IdeaDocument } from "../models/Idea";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, username } = req.body;

    let data = req.body;
    let inputCheck = inputObjectCheck(data);
    if (inputCheck) return res.status(400).json({ error: inputCheck });

    // enforcing unique login details
    const isEmailRegistered = await UserService.findUserByEmail(email);
    const isUsernameRegistered = await UserService.findUserByUsername(username);
    if (isUsernameRegistered && isEmailRegistered)
      return res
        .status(400)
        .json({ error: "The e-mail and the username are already in use." });
    if (isEmailRegistered)
      return res
        .status(400)
        .json({ error: "This email is already registered." });
    if (isUsernameRegistered)
      return res
        .status(400)
        .json({ error: "This username is already in use." });

    // bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      login: {
        email,
        password: hashedPassword,
        username,
      },
    });
    const user: any = await UserService.createUser(newUser);
    return res.json(user);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return next(new BadRequestError("Invalid Request", error));
    } else {
      return next(new InternalServerError("Internal Server Error", error));
    }
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.findUserByEmail(email);
    if (user) {
      const isCorrectPassword = await bcrypt.compare(
        password,
        user.login.password
      );
      if (!isCorrectPassword) {
        return next(new BadRequestError("Password is Incorrect"));
      }
      const token = jwt.sign(
        {
          id: user._id,
          email: user.login.email,
          username: user.login.username,
          admin: user.login.admin,
          banned: user.login.banned,
        },
        JWT_SECRET
      );
      // if token expires, add argument after JWT_SECRET:
      //  { expiresIn: "1hr" }
      return res.json({ token, user });
    } else {
      return next(new NotFoundError("User email does not exist"));
    }
  } catch (error) {
    return next(new InternalServerError("Internal Server Error"));
  }
};

export const findAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json(await UserService.findAllUsers());
  } catch (error) {
    return next(new NotFoundError("Users not found", error));
  }
};

export const findOneUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    let fetchedUser = await UserService.findOneUser(id);
    let user: any = fetchedUser ? { ...fetchedUser.toJSON() } : null;

    if (user?.interactions) {
      let interactionType: string[] = ["upvotes", "downvotes", "favorites"];
      interactionType.forEach((interaction: string) => {
        user.interactions[interaction].forEach((idea: any) => {
          if (idea.anonymous && typeof idea.author === "object") {
            idea.author.login.username = "Anonymous";
            idea.author._id = "hidden";
            idea.author.personal.avatar = "";
            idea.author.power = 0;
          }
        });
      });
    }
    return res.json(user);
  } catch (error) {
    return next(new NotFoundError("User not found", error));
  }
};

export const findOneUserPublic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    let notPublicUser = await UserService.findOneUserPublic(id);

    //sorry, TS errors are confusing, can't fix it atm
    let user: any = notPublicUser ? notPublicUser.toJSON() : null;

    if (user && user.personal) {
      //if personal info is set to public=false, delete it from returned user object
      !user.personal.name.public ? delete user.personal.name : null;
      !user.personal.birthday.public ? delete user.personal.birthday : null;
      !user.personal.location.country.public
        ? delete user.personal.location
        : null;
      !user.personal.contacts.email.public
        ? delete user.personal.contacts.email
        : null;
      !user.personal.contacts.phone.public
        ? delete user.personal.contacts.phone
        : null;
      user.personal.contacts.links = user.personal.contacts.links.filter(
        (link: LinkType) => link.public
      );
    }
    return res.json(user);
  } catch (error) {
    return next(new NotFoundError("User not found", error));
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  let data = req.body;

  let inputCheck = inputObjectCheck(data);
  if (inputCheck) return res.status(400).json({ error: inputCheck });

  // only allow admin and banned states to be set by an admin
  if (
    //@ts-ignore
    (!req?.user?.login?.admin &&
      typeof req.body.login?.admin !== "undefined") ||
    //@ts-ignore
    (!req?.user?.login?.admin && typeof req.body.login?.banned !== "undefined")
  )
    return res.status(400).json({
      error:
        "Insufficient permissions for setting roles. You must be an admin to modify user roles and access.",
    });

  // assuming the whole links section is sent...
  let links = data?.personal?.contacts?.links;
  if (links && links.length > 5) {
    return res.status(400).json({
      error: "Too many links. You can add up to 5 links.",
    });
  }

  let password: string = data?.login?.password;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    data.login.password = hashedPassword;
  }

  //remove things that should not be updated with this function
  if (data?.ideas) delete data.ideas;
  if (data?.interactions) delete data.interactions;
  if (data?.messages) delete data.messages;
  if (data?.power) delete data.power;
  if (data?.follow) delete data.follow;
  if (data?._id) delete data.follow;

  try {
    let user = await UserService.findFullUser(id);
    if (user) {
      let updatedUser = mergeDeepWithArrayOverwrite({ ...user.toJSON() }, data);
      let updatedUserDocument = await UserService.updateUser(id, updatedUser);
      return res.json(updatedUserDocument);
    }
  } catch (error) {
    return next(new NotFoundError("User not found", error));
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { userId } = req.params;
  let { purge } = req.body;
  if (!purge || purge.ideas == "undefined" || purge.comments == "undefined")
    return res.status(400).json({ error: "Missing purge instructions." });

  try {
    let user = await UserService.findOneUserUnpopulated(userId);

    if (user) {
      if (user.login.admin)
        return res.status(400).json({
          error:
            "Admin users cannot be deleted. Please ask the webmaster to revoke your admin rights before you delete your account.",
        });

      if (purge?.comments) {
        //delete comment and remove its id from the idea
        let comments = user?.interactions?.comments;
        if (comments && comments.length > 0) {
          comments.forEach(async (id) => {
            let comment = await CommentService.deleteComment(id);
            if (comment) {
              await IdeaService.removeCommentFromIdea(comment.idea, id);
            }
          });
        }
      }
      if (purge?.ideas) {
        //completely purge everything in it
        let ideas = user?.ideas;
        if (ideas && ideas.length > 0) {
          ideas.forEach(async (ideaId) => {
            let idea = await IdeaService.deleteIdea(ideaId);
            if (idea) {
              // remove idea from other users' interactions
              idea.stats.favorites.users.forEach(async (userId: string) => {
                await UserService.removeFavoriteIdeaFromUser(userId, ideaId);
              });
              idea.stats.upvotes.users.forEach(async (userId: string) => {
                await UserService.removeUpvoteFromUser(userId, ideaId);
              });
              idea.stats.downvotes.users.forEach(async (userId: string) => {
                await UserService.removeDownvoteFromUser(userId, ideaId);
              });
              // update tags of idea
              // if no ideas in tag, delete tag
              idea.tags.forEach(async (tag: string) => {
                let updatedTag = await TagService.updateTag(tag, -1);
                await TagService.removeIdeaFromTag(tag, ideaId);
                if (updatedTag && updatedTag?.count < 1) {
                  await TagService.deleteTag(tag);
                }
              });
              idea.comments.forEach(async (commentId: string) => {
                await CommentService.deleteComment(commentId);
              });
            }
          });
        }
      }

      //purge upvotes, downvotes
      let upvotes = user?.interactions?.upvotes;
      if (upvotes && upvotes.length > 0) {
        upvotes.forEach(async (ideaId) => {
          let ideaToCheck = await IdeaService.findIdeaByIdUnpopulated(ideaId);
          if (ideaToCheck && ideaToCheck.stats.upvotes.users.includes(userId)) {
            let upvotedIdea = await IdeaService.removeUserFromUpvotes(
              ideaId,
              userId
            );
            if (upvotedIdea) {
              await UserService.powerUpdate(ideaToCheck.author, -1);
            }
          }
        });
      }
      let downvotes = user?.interactions?.downvotes;
      if (downvotes && downvotes.length > 0) {
        downvotes.forEach(async (ideaId) => {
          let ideaToCheck = await IdeaService.findIdeaByIdUnpopulated(ideaId);
          if (
            ideaToCheck &&
            ideaToCheck.stats.downvotes.users.includes(userId)
          ) {
            let downvotedIdea = await IdeaService.removeUserFromDownvotes(
              ideaId,
              userId
            );
            if (downvotedIdea) {
              await UserService.powerUpdate(ideaToCheck.author, 1);
            }
          }
        });
      }

      //purge favorites
      let favorites = user?.interactions?.favorites;
      if (favorites && favorites.length > 0) {
        favorites.forEach(async (ideaId) => {
          let ideaToCheck = await IdeaService.findIdeaByIdUnpopulated(ideaId);
          if (
            ideaToCheck &&
            ideaToCheck.stats.favorites.users.includes(userId)
          ) {
            let favoriteIdea = await IdeaService.removeUserFromFavorites(
              ideaId,
              userId
            );
            if (favoriteIdea) {
              await UserService.powerUpdate(ideaToCheck.author, -10);
            }
          }
        });
      }

      //purge followers, followings
      let followers = user?.follow?.followers?.users;
      if (followers && followers.length > 0) {
        followers.forEach(async (followerId) => {
          let follower = await UserService.findOneUserUnpopulated(followerId);
          if (follower && follower.follow.following.users.includes(userId)) {
            await UserService.removeFollowing(followerId, userId);
          }
        });
      }
      let followings = user?.follow?.following?.users;
      if (followings && followings.length > 0) {
        followings.forEach(async (followingId) => {
          let following = await UserService.findOneUserUnpopulated(followingId);
          if (following && following.follow.followers.users.includes(userId)) {
            await UserService.removeFollower(followingId, userId);
          }
        });
      }

      //also do a message purge (if not present in penpal)
      let messages = user?.messages;
      if (messages && messages.length > 0) {
        messages.forEach(async (messageWithUser) => {
          messageWithUser.messages.forEach(async (messageId) => {
            let check = await MessageService.checkIfUserHasThisMessage(
              messageWithUser.penpal,
              userId,
              messageId
            );
            if (!check) {
              await MessageService.actuallyDeleteMessage(messageId);
            }
          });
        });
      }

      // reset the user for id preservation
      // to make sure populate() on preserved documents can't fail
      let resetUser = { ...defaultUser(userId, user.login.username).toJSON() };
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(resetUser.login.password, salt);
      resetUser.login.password = hashedPassword;
      delete resetUser._id;
      let updatedUser = await UserService.updateUser(userId, resetUser);
      return res.json(updatedUser);
    } else {
      return res.json(user);
    }
  } catch (error) {
    return next(new NotFoundError("User not found", error));
  }
};

export const followUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { toFollow, theirFollower } = req.params;

  if (toFollow === theirFollower)
    return res.status(400).json({ error: "You cannot follow yourself." });

  try {
    const userWhoIsAboutToBeFollowed = await UserService.findOneUserUnpopulated(
      toFollow
    );

    if (!userWhoIsAboutToBeFollowed)
      return res.status(400).json({ error: "This user doesn't exist." });
    if (
      userWhoIsAboutToBeFollowed?.follow.followers.users.includes(theirFollower)
    ) {
      return res
        .status(400)
        .json({ error: "You are already following this user." });
    }

    const followingUser = await UserService.addFollowing(
      theirFollower,
      toFollow
    );

    let userToFollow = followingUser
      ? await UserService.addFollower(toFollow, theirFollower)
      : null;

    return res.json([userToFollow, followingUser]);
  } catch (error) {
    return next(new NotFoundError("User not found", error));
  }
};

export const unfollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { toUnfollow, theirUnfollower } = req.params;

  try {
    const userWhoIsAboutToBeUnfollowed =
      await UserService.findOneUserUnpopulated(toUnfollow);
    if (!userWhoIsAboutToBeUnfollowed)
      return res.status(400).json({ error: "This user doesn't exist." });

    if (
      !userWhoIsAboutToBeUnfollowed?.follow.followers.users.includes(
        theirUnfollower
      )
    ) {
      return res
        .status(400)
        .json({ error: "Cannot unfollow - you weren't following this user." });
    }

    const unfollowingUser = await UserService.removeFollowing(
      theirUnfollower,
      toUnfollow
    );

    const userToUnfollow = unfollowingUser
      ? await UserService.removeFollower(toUnfollow, theirUnfollower)
      : null;

    return res.json([userToUnfollow, unfollowingUser]);
  } catch (error) {
    return next(new NotFoundError("User not found", error));
  }
};
