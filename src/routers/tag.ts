import express from "express";
import passport from "passport";

import {
  //createTag,
  //deleteTagById,
  findAllTags,
  findAllTagsWithPublishedIdeas,
  findTagByTitle,
  findTagByTitleWithPublishedIdeas,
} from "../controllers/tag";
import { requesterBannedOrDeleted } from "../middlewares/requesterBannedOrDeleted";
import { isUserAdmin } from "../middlewares/isUserAdmin";

const router = express.Router();

let auth = passport.authenticate("jwt", { session: false });

//tag creation and deletion are handled by inner functions
//therefore this is disabled for now
//router.post("/", auth, requesterBannedOrDeleted, isUserAdmin, createTag);
//router.delete("/:id", auth, requesterBannedOrDeleted, isUserAdmin, deleteTagById);

router.get("/all", auth, isUserAdmin, findAllTags);
router.get(
  "/published",
  auth,
  requesterBannedOrDeleted,
  findAllTagsWithPublishedIdeas
);

router.get("/:title/all", auth, isUserAdmin, findTagByTitle);
router.get(
  "/:title/published",
  auth,
  requesterBannedOrDeleted,
  findTagByTitleWithPublishedIdeas
);

export default router;
