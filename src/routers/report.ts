import express from "express";
import passport from "passport";

import { isUserAdmin } from "../middlewares/isUserAdmin";
import { requesterBannedOrDeleted } from "../middlewares/requesterBannedOrDeleted";
import { IsUserRelevant } from "../middlewares/isUserRelevant";
import {
  createReport,
  updateReport,
  deleteReport,
  findAllReports,
  findReportById,
  findAssignedReports,
  findReportsByRef,
  assignReport,
} from "../controllers/report";

const router = express.Router();

let auth = passport.authenticate("jwt", { session: false });

router.post(
  "/",
  auth,
  requesterBannedOrDeleted,
  IsUserRelevant.requesterMatchesReporter,
  createReport
);

router.get("/all", auth, isUserAdmin, findAllReports);
router.get("/assigned/:assignedTo", auth, isUserAdmin, findAssignedReports);
router.get("/ref/:ref", auth, isUserAdmin, findReportsByRef);

router.get("/:id", auth, isUserAdmin, findReportById);
router.patch("/:id", auth, isUserAdmin, updateReport);
router.delete("/:id", auth, isUserAdmin, deleteReport);

router.patch("/:reportId/assign/:userId", auth, isUserAdmin, assignReport);

export default router;
