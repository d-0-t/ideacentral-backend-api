import Comment, { CommentDocument } from "../models/Comment";

async function createComment(
  Comment: CommentDocument
): Promise<CommentDocument> {
  return Comment.save();
}

async function findAllComments(): Promise<CommentDocument[]> {
  return Comment.find()
    .populate({ path: "author", select: "login.username power" })
    .populate({
      path: "idea",
      select:
        "title stats.favorites.count stats.upvotes.count stats.downvotes.count",
    });
}

async function findCommentById(id: string): Promise<CommentDocument | null> {
  const comment = await Comment.findById(id)
    .populate({ path: "author", select: "login.username power" })
    .populate({
      path: "idea",
      select:
        "title stats.favorites.count stats.upvotes.count stats.downvotes.count",
    });
  return comment;
}

async function findCommentsByIdea(idea: string): Promise<CommentDocument[]> {
  return Comment.find({ idea })
    .populate({ path: "author", select: "login.username power" })
    .populate({
      path: "idea",
      select:
        "title stats.favorites.count stats.upvotes.count stats.downvotes.count",
    });
}

async function findCommentsByAuthor(
  author: string
): Promise<CommentDocument[]> {
  return Comment.find({ author })
    .populate({ path: "author", select: "login.username power" })
    .populate({
      path: "idea",
      select:
        "title stats.favorites.count stats.upvotes.count stats.downvotes.count",
    });
}

async function updateComment(
  id: string,
  comment: any
): Promise<CommentDocument | null> {
  const commentObj = await Comment.findByIdAndUpdate(
    id,
    { comment },
    { new: true }
  )
    .populate({ path: "author", select: "login.username power" })
    .populate({
      path: "idea",
      select:
        "title stats.favorites.count stats.upvotes.count stats.downvotes.count",
    });
  return commentObj;
}

async function deleteComment(id: string): Promise<CommentDocument | null> {
  const comment = await Comment.findByIdAndDelete(id);
  return comment;
}

export default {
  createComment,
  findCommentById,
  findCommentsByIdea,
  findCommentsByAuthor,
  findAllComments,
  deleteComment,
  updateComment,
};
