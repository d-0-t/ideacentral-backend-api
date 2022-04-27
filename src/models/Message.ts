/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from "mongoose";

export type MessageDocument = Document & {
  sender: string;
  recipient: string;
  message: string;
};

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Types.ObjectId, ref: "User" },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<MessageDocument>("Message", messageSchema);
