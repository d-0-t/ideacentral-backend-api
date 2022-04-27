import { Request, Response, NextFunction } from "express";
import Message from "../models/Message";
import MessageService from "../services/message";
import UserService from "../services/user";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../helpers/apiError";
import { inputObjectCheck } from "../helpers/inputCheck";

export const newMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { sender, recipient, message } = req.body;

  let inputCheck = inputObjectCheck(req.body);
  if (inputCheck) return res.status(400).json({ error: inputCheck });

  try {
    let senderCheck = await UserService.findOneUser(sender);
    if (!senderCheck)
      return res.status(400).json({ error: "User (sender) not found." });

    let recipientCheck = await UserService.findOneUser(recipient);
    if (!recipientCheck)
      return res.status(400).json({ error: "User (recipient) not found." });

    const newMessage = new Message({ sender, recipient, message });
    const sentMessage: any = await MessageService.newMessage(newMessage);
    await MessageService.addMessageToUser(sender, recipient, sentMessage._id);
    await MessageService.readMessagesOfUser(sender, recipient);
    await MessageService.addMessageToUser(recipient, sender, sentMessage._id);

    return res.json(sentMessage);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return next(new BadRequestError("Invalid Request", error));
    } else {
      return next(new InternalServerError("Internal Server Error", error));
    }
  }
};

export const findAllMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json(await MessageService.findAllMessages());
  } catch (error) {
    return next(new NotFoundError("Messages not found", error));
  }
};

export const findMessageById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    return res.json(await MessageService.findMessageById(id));
  } catch (error) {
    return next(new NotFoundError("Message not found", error));
  }
};

export const readMessagesOfUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { userId, penpalId } = req.params;
  try {
    let readMsg = await MessageService.readMessagesOfUser(userId, penpalId);
    return res.json(readMsg?.messages);
  } catch (error) {
    return next(new NotFoundError("Message not found", error));
  }
};
export const unreadMessagesOfUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { userId, penpalId } = req.params;
  try {
    let readMsg = await MessageService.unreadMessagesOfUser(userId, penpalId);
    return res.json(readMsg?.messages);
  } catch (error) {
    return next(new NotFoundError("Message not found", error));
  }
};

// this does not delete from message db by default
// only if it is removed from both participants
export const deleteOneMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id, userId } = req.params;
  try {
    let msg = await MessageService.findMessageById(id);
    if (!msg) return res.status(400).json({ error: "Message not found" });

    let penpalId: string;
    msg.recipient.toString() === userId.toString()
      ? (penpalId = msg.sender)
      : (penpalId = msg.recipient);

    if (msg) {
      let removedMsg = await MessageService.removeOneMessageFromUser(
        userId,
        penpalId,
        id
      );
      if (removedMsg) {
        let check = await MessageService.checkIfUserHasThisMessage(
          penpalId,
          userId,
          id
        );
        if (!check) {
          await MessageService.actuallyDeleteMessage(id);
        }
      }
    }

    return res.json(msg);
  } catch (error) {
    return next(new NotFoundError("Message not found", error));
  }
};

// this function deletes the message ids with a penpal
// from an user's object
// if neither user has the message anymore,
// it also deletes the affected messages from the database
export const deleteAllMessagesWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { userId, penpalId } = req.params;
  try {
    let messagesWithPenpal = await MessageService.checkIfUserHasThisPenpal(
      userId,
      penpalId
    );
    let messageArray: string[] = [];
    if (messagesWithPenpal) {
      //@ts-ignore
      messageArray = [...messagesWithPenpal];
    }
    let deletion = await MessageService.removeAllMessagesWithUser(
      userId,
      penpalId
    );
    if (deletion) {
      // check if participant already deleted the user as penpal
      // if they did, delete messages from the db too
      let check = await MessageService.checkIfUserHasThisPenpal(
        penpalId,
        userId
      );
      if (!check) {
        messageArray?.forEach(async (message: string) => {
          await MessageService.actuallyDeleteMessage(message);
        });
      }
    }
    return res.json({ message: "The messages are now deleted." });
  } catch (error) {
    return next(new NotFoundError("Messages not found", error));
  }
};
