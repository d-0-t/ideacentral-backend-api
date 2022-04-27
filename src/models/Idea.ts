/* eslint-disable @typescript-eslint/member-delimiter-style */

import mongoose, { Document } from "mongoose";

export type IdeaDocument = Document & {
  author: string;
  title: string;
  description: string;
  tags: string[];
  published: boolean;
  anonymous: boolean;
  comments: string[];
  stats: {
    upvotes: {
      count: number;
      users: string[];
    };
    downvotes: {
      count: number;
      users: string[];
    };
    favorites: {
      count: number;
      users: string[];
    };
  };
};

const ideaSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String, ref: "Tag" }],
    published: { type: Boolean, default: true },
    anonymous: { type: Boolean, default: false },
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
    stats: {
      upvotes: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      },
      downvotes: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      },
      favorites: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IdeaDocument>("Idea", ideaSchema);
