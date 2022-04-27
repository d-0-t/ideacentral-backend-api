import express from "express";
import passport from "passport";
import { IsUserRelevant } from "../middlewares/isUserRelevant";

import {
  createUser,
  updateUser,
  deleteUser,
  findAllUsers,
  findOneUser,
  findOneUserPublic,
  loginUser,
  followUser,
  unfollowUser,
} from "../controllers/user";
import { isUserAdmin } from "../middlewares/isUserAdmin";
import { requesterBannedOrDeleted } from "../middlewares/requesterBannedOrDeleted";

const router = express.Router();

let auth = passport.authenticate("jwt", { session: false });

router.post("/", createUser);
router.post("/login", loginUser);

router.get("/all", auth, isUserAdmin, findAllUsers);

router.patch(
  "/:id",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.matchingUserOrAdmin,
  IsUserRelevant.isTargetedUserDeleted,
  updateUser
);

//all user info (except password) - for admins and profile owners
router.get("/:id", auth, IsUserRelevant.matchingUserOrAdmin, findOneUser);
//only public info, for people who are logged in
router.get("/:id/public", auth, requesterBannedOrDeleted, findOneUserPublic);

//following
router.patch(
  "/:toFollow/follow/:theirFollower",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.follow,
  IsUserRelevant.isTargetedUserDeleted,
  followUser
);
router.patch(
  "/:toUnfollow/unfollow/:theirUnfollower",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.follow,
  IsUserRelevant.isTargetedUserDeleted,
  unfollowUser
);

router.patch(
  "/delete/:userId",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.matchingUserOrAdmin,
  IsUserRelevant.isTargetedUserDeleted,
  deleteUser
);

export default router;
