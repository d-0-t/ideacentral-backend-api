/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from "mongoose";

export type TagDocument = Document & {
  title: string;
  count: number;
  ideas: string[];
};

const tagSchema = new mongoose.Schema(
  {
    title: { type: String, unique: true, required: true, lowercase: true },
    count: { type: Number, default: 0 },
    ideas: [{ type: mongoose.Types.ObjectId, ref: "Idea" }],
  },
  { timestamps: true }
);

export default mongoose.model<TagDocument>("Tag", tagSchema);
