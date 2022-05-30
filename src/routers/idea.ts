import express from "express";

import passport from "passport";
import { requesterBannedOrDeleted } from "../middlewares/requesterBannedOrDeleted";
import { isUserAdmin } from "../middlewares/isUserAdmin";
import { IsUserRelevant } from "../middlewares/isUserRelevant";
import {
  addFavorite,
  createIdea,
  deleteIdea,
  downvoteIdea,
  findAllIdeas,
  findAllPublishedIdeas,
  findIdeaById,
  removeDownvoteFromIdea,
  removeFavorite,
  removeUpvoteFromIdea,
  updateIdea,
  upvoteIdea,
} from "../controllers/idea";

const router = express.Router();

let auth = passport.authenticate("jwt", { session: false });

router.get("/all", auth, isUserAdmin, findAllIdeas);
router.get("/published", findAllPublishedIdeas); // this is public now, but previously it wasn't
//router.get("/published", auth, requesterBannedOrDeleted, findAllPublishedIdeas);
router.get(
  "/:id",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.ideaIdRequestAccessValidation,
  findIdeaById
);

router.post(
  "/",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatchesAuthor,
  createIdea
);
router.patch(
  "/:id",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.ideaAuthor,
  updateIdea
);
router.delete(
  "/:id",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.ideaAuthorOrAdmin,
  deleteIdea
);

//INTERACTIONS

router.patch(
  "/:ideaId/fav/:userId",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  addFavorite
);
router.patch(
  "/:ideaId/unfav/:userId",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  removeFavorite
);

router.patch(
  "/:ideaId/upvote/:userId",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  upvoteIdea
);
router.patch(
  "/:ideaId/upvote-remove/:userId",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  removeUpvoteFromIdea
);

router.patch(
  "/:ideaId/downvote/:userId",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  downvoteIdea
);
router.patch(
  "/:ideaId/downvote-remove/:userId",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatches,
  removeDownvoteFromIdea
);

export default router;
