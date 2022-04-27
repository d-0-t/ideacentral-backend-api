import User, { UserDocument } from "../models/User";
import Message, { MessageDocument } from "../models/Message";

async function newMessage(Message: MessageDocument): Promise<MessageDocument> {
  return Message.save();
}

async function findMessageById(id: string): Promise<MessageDocument | null> {
  const message = await Message.findById(id);
  return message;
}

async function findAllMessages(): Promise<MessageDocument[]> {
  return Message.find();
}

async function actuallyDeleteMessage(
  id: string
): Promise<MessageDocument | null> {
  const message = Message.findByIdAndDelete(id);
  return message;
}

/////////////////////////////////////

async function addMessageToUser(
  userId: string,
  penpalId: string,
  messageId: string
): Promise<UserDocument | null> {
  const user = await User.findById(userId);
  if (user) {
    if (user.messages.length > 0) {
      for (let i = 0; i < user.messages.length; i++) {
        let msg = user.messages[i];
        if (msg.penpal == penpalId) {
          user.messages[i].messages.push(messageId);
          user.messages[i].read = false;
          return user.save();
        }
      }
    }

    let newMessage: any = {
      penpal: penpalId,
      messages: [messageId],
      read: false,
    };
    user.messages.push(newMessage);
    return user.save();
  }
  return null;
}

async function removeOneMessageFromUser(
  userId: string,
  penpalId: string,
  messageId: string
): Promise<UserDocument | null> {
  const user = await User.findById(userId);
  if (user) {
    for (let i = 0; i < user.messages.length; i++) {
      let msg = user.messages[i];
      if (msg.penpal.toString() === penpalId.toString()) {
        for (let j = 0; j < msg.messages.length; j++) {
          if (msg.messages[j] == messageId) {
            msg.messages.splice(j, 1);
            // if there are no messages left,
            // remove the whole conversation
            if (msg.messages.length === 0) {
              user.messages.splice(i, 1);
            }
            return user.save();
          }
        }
        return null;
      }
    }
  }
  return null;
}

async function removeAllMessagesWithUser(
  userId: string,
  penpalId: string
): Promise<Boolean | any> {
  const user = await User.findById(userId);
  if (user) {
    for (let i = 0; i < user.messages.length; i++) {
      if (user.messages[i].penpal == penpalId) {
        user.messages.splice(i, 1);
        return user.save();
      }
    }
  }
  return null;
}

/////////////////////////////////////

async function checkIfUserHasThisMessage(
  userId: string,
  penpalId: string,
  messageId: string
): Promise<Boolean> {
  const user = await User.findById(userId);
  if (user) {
    for (let i = 0; i < user.messages.length; i++) {
      let msg = user.messages[i];
      if (msg.penpal == penpalId) {
        for (let j = 0; j < msg.messages.length; j++) {
          if (msg.messages[j] == messageId) {
            return true;
          }
        }
        return false;
      }
    }
  }
  return false;
}

async function checkIfUserHasThisPenpal(
  userId: string,
  penpalId: string
): Promise<Boolean | string[]> {
  const user = await User.findById(userId);
  if (user) {
    for (let i = 0; i < user.messages.length; i++) {
      let msg = user.messages[i];
      if (msg.penpal == penpalId) {
        return msg.messages;
      }
    }
  }
  return false;
}

/////////////////////////////////////

async function readMessagesOfUser(
  userId: string,
  penpalId: string
): Promise<UserDocument | null> {
  const user = await User.findById(userId);
  if (user) {
    for (let i = 0; i < user.messages.length; i++) {
      let msg = user.messages[i];
      if (msg.penpal == penpalId) {
        msg.read = true;
        return user.save();
      }
    }
  }
  return null;
}

async function unreadMessagesOfUser(
  userId: string,
  penpalId: string
): Promise<UserDocument | null> {
  const user = await User.findById(userId);
  if (user) {
    for (let i = 0; i < user.messages.length; i++) {
      let msg = user.messages[i];
      if (msg.penpal == penpalId) {
        msg.read = false;
        return user.save();
      }
    }
  }
  return null;
}

export default {
  newMessage,
  findMessageById,
  findAllMessages,
  actuallyDeleteMessage,
  addMessageToUser,
  removeOneMessageFromUser,
  removeAllMessagesWithUser,
  checkIfUserHasThisMessage,
  checkIfUserHasThisPenpal,
  readMessagesOfUser,
  unreadMessagesOfUser,
};
