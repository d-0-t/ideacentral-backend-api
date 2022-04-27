import express from "express";
import passport from "passport";
import { requesterBannedOrDeleted } from "../middlewares/requesterBannedOrDeleted";
import { isUserAdmin } from "../middlewares/isUserAdmin";
import { IsUserRelevant } from "../middlewares/isUserRelevant";
import {
  createComment,
  deleteComment,
  findAllComments,
  findCommentById,
  findCommentsByAuthor,
  findCommentsByIdea,
  updateComment,
} from "../controllers/comment";

const router = express.Router();

let auth = passport.authenticate("jwt", { session: false });

//these 4 GETs don't need to be accessible by every user
//as the objects will be contained by the user profile or ideas
router.get("/all", auth, isUserAdmin, findAllComments);
router.get("/:id", auth, isUserAdmin, findCommentById);
router.get("/author/:userId", auth, isUserAdmin, findCommentsByAuthor);
router.get("/idea/:ideaId", auth, isUserAdmin, findCommentsByIdea);

router.post(
  "/",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatchesAuthor,
  createComment
);
router.patch(
  "/:id",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.commentAuthor,
  updateComment
);
router.delete(
  "/:id",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.commentAuthorOrAdmin,
  deleteComment
);

export default router;
