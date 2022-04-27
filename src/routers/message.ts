import express from "express";
import passport from "passport";

import { requesterBannedOrDeleted } from "../middlewares/requesterBannedOrDeleted";
import { isUserAdmin } from "../middlewares/isUserAdmin";
import { IsUserRelevant } from "../middlewares/isUserRelevant";
import {
  newMessage,
  //findAllMessages,
  findMessageById,
  readMessagesOfUser,
  unreadMessagesOfUser,
  deleteAllMessagesWithUser,
  deleteOneMessage,
} from "../controllers/message";

const router = express.Router();

let auth = passport.authenticate("jwt", { session: false });

//no reason to have this active...
//router.get("/all", auth, isUserAdmin, findAllMessages);

//for utility purposes
router.get("/:id", auth, isUserAdmin, findMessageById);

router.post(
  "/",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatchesSender,
  IsUserRelevant.recipientDeletedOrBanned,
  newMessage
);

//READ, UNREAD
router.patch(
  "/:userId/read/:penpalId",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  readMessagesOfUser
);
router.patch(
  "/:userId/unread/:penpalId",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  unreadMessagesOfUser
);

//DELETE (special)
router.patch(
  "/:id/delete/:userId",
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  deleteOneMessage
);
router.patch(
  "/:userId/deleteconversation/:penpalId",
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  deleteAllMessagesWithUser
);

export default router;
