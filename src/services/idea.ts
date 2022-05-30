import Idea, { IdeaDocument } from "../models/Idea";

async function createIdea(Idea: IdeaDocument): Promise<IdeaDocument> {
  return Idea.save();
}

async function findAllIdeas(): Promise<IdeaDocument[]> {
  return Idea.find()
    .populate({
      path: "author",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "stats.upvotes.users",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "stats.downvotes.users",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "stats.favorites.users",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "login.username personal.avatar power",
      },
    });
}
async function findIdeaByIdUnpopulated(
  id: string
): Promise<IdeaDocument | null> {
  let idea = await Idea.findById(id);
  return idea;
}
async function findIdeaById(id: string): Promise<IdeaDocument | null> {
  let idea = await Idea.findById(id)
    .populate({
      path: "author",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "stats.upvotes.users",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "stats.downvotes.users",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "stats.favorites.users",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "login.username personal.avatar power",
      },
    });
  return idea;
}
async function findAllPublishedIdeas(): Promise<IdeaDocument[]> {
  let idea = await Idea.find({ published: true })
    .populate({
      path: "author",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "stats.upvotes.users",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "stats.downvotes.users",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "stats.favorites.users",
      select: "login.username personal.avatar power",
    })
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "login.username personal.avatar power",
      },
    });
  return idea;
}

async function updateIdea(id: string, data: any): Promise<IdeaDocument | null> {
  return await Idea.findByIdAndUpdate(id, data, { new: true });
}

async function deleteIdea(id: string): Promise<IdeaDocument | null> {
  const idea = Idea.findByIdAndDelete(id);
  return idea;
}

//////////////////////////////////////////////

async function addUserToFavorites(
  ideaId: string,
  userId: string
): Promise<IdeaDocument | null> {
  const idea = await Idea.findByIdAndUpdate(
    ideaId,
    {
      $push: {
        "stats.favorites.users": userId,
      },
      $inc: {
        "stats.favorites.count": 1,
      },
    },
    { new: true }
  ).select("stats.favorites");
  return idea;
}

async function removeUserFromFavorites(
  ideaId: string,
  userId: string
): Promise<IdeaDocument | null> {
  const idea = await Idea.findByIdAndUpdate(
    ideaId,
    {
      $pull: {
        "stats.favorites.users": userId,
      },
      $inc: {
        "stats.favorites.count": -1,
      },
    },
    { new: true }
  ).select("stats.favorites");
  return idea;
}

//////////////////////////////////////////////

async function addUserToUpvotes(
  ideaId: string,
  userId: string
): Promise<IdeaDocument | null> {
  const idea = await Idea.findByIdAndUpdate(
    ideaId,
    {
      $push: {
        "stats.upvotes.users": userId,
      },
      $inc: {
        "stats.upvotes.count": 1,
      },
    },
    { new: true }
  ).select("stats");
  return idea;
}

async function removeUserFromUpvotes(
  ideaId: string,
  userId: string
): Promise<IdeaDocument | null> {
  const idea = await Idea.findByIdAndUpdate(
    ideaId,
    {
      $pull: {
        "stats.upvotes.users": userId,
      },
      $inc: {
        "stats.upvotes.count": -1,
      },
    },
    { new: true }
  ).select("stats");
  return idea;
}

async function addUserToDownvotes(
  ideaId: string,
  userId: string
): Promise<IdeaDocument | null> {
  const idea = await Idea.findByIdAndUpdate(
    ideaId,
    {
      $push: {
        "stats.downvotes.users": userId,
      },
      $inc: {
        "stats.downvotes.count": 1,
      },
    },
    { new: true }
  ).select("stats");
  return idea;
}
async function removeUserFromDownvotes(
  ideaId: string,
  userId: string
): Promise<IdeaDocument | null> {
  const idea = await Idea.findByIdAndUpdate(
    ideaId,
    {
      $pull: {
        "stats.downvotes.users": userId,
      },
      $inc: {
        "stats.downvotes.count": -1,
      },
    },
    { new: true }
  ).select("stats");
  return idea;
}

//////////////////////////////////////////////

async function addCommentToIdea(
  ideaId: string,
  commentId: string
): Promise<IdeaDocument | null> {
  const idea = await Idea.findByIdAndUpdate(
    ideaId,
    {
      $push: {
        comments: commentId,
      },
    },
    { new: true }
  ).select("comments");
  return idea;
}
async function removeCommentFromIdea(
  ideaId: string,
  commentId: string
): Promise<IdeaDocument | null> {
  const idea = await Idea.findByIdAndUpdate(
    ideaId,
    {
      $pull: {
        comments: commentId,
      },
    },
    { new: true }
  ).select("comments");
  return idea;
}

//////////////////////////////////////////////

export default {
  createIdea,
  findIdeaById,
  findIdeaByIdUnpopulated,
  findAllIdeas,
  findAllPublishedIdeas,
  updateIdea,
  deleteIdea,
  addUserToFavorites,
  removeUserFromFavorites,
  addUserToUpvotes,
  removeUserFromUpvotes,
  addUserToDownvotes,
  removeUserFromDownvotes,
  addCommentToIdea,
  removeCommentFromIdea,
};
