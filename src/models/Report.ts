/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from "mongoose";

export type ReportDocument = Document & {
  by: string[];
  ref: "User" | "Comment" | "Message" | "Idea";
  targetedUserId: string;
  contentId: string;
  content: any;
  description: string[];
  status: "new" | "pending" | "closed";
  assignedTo: string;
  reportCount: number;
};

const reportSchema = new mongoose.Schema(
  {
    by: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
    ref: { type: String, required: true },
    targetedUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentId: { type: String, required: true, unique: true },
    content: { type: Object },
    description: [{ type: String, required: true }],
    status: { type: String, default: "new" },
    assignedTo: { type: mongoose.Types.ObjectId, ref: "User" },
    reportCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model<ReportDocument>("Report", reportSchema);
