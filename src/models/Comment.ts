/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from "mongoose";

export type CommentDocument = Document & {
  author: string;
  idea: string;
  comment: string;
};

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Types.ObjectId, ref: "User" },
    idea: { type: mongoose.Types.ObjectId, ref: "Idea" },
    comment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<CommentDocument>("Comment", commentSchema);
