import { Request, Response, NextFunction } from "express";
import Report from "../models/Report";
import ReportService from "../services/report";
import UserService from "../services/user";
import CommentService from "../services/comment";
import MessageService from "../services/message";

import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../helpers/apiError";
import { inputObjectCheck } from "../helpers/inputCheck";

export const createReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { by, ref, targetedUserId, contentId, description } = req.body;

    let refArr: string[] = ["User", "Comment", "Idea", "Message"];
    if (!refArr.includes(ref))
      return res.status(400).json({ error: "Invalid reference type" });

    let inputCheck = inputObjectCheck(req.body);
    if (inputCheck) return res.status(400).json({ error: inputCheck });

    //check if reporting user and targeted user exists
    try {
      let checkBy = await UserService.findOneUser(by);
      let checkTarget = await UserService.findOneUser(targetedUserId);

      if (!checkBy && !checkTarget) {
        return res
          .status(400)
          .json({ error: `Reporting and reported user doesn't exist.` });
      } else if (!checkTarget) {
        return res.status(400).json({ error: `Reported user doesn't exist.` });
      } else if (!checkBy) {
        return res
          .status(400)
          .json({ error: `Reporting user/author doesn't exist.` });
      }
    } catch (error) {
      return next(new NotFoundError("Report update failed", error));
    }

    // check if contentId is really part of a valid ref
    // if it is, assign it to the content object to pass to report
    // copy is needed in case the original is deleted

    let content: any;
    switch (ref) {
      case "User":
        try {
          let check = await UserService.findOneUser(contentId);
          if (!check) {
            return res
              .status(400)
              .json({ error: `Reported ${ref.toLowerCase()} doesn't exist.` });
          } else {
            check.login.password = "hidden";
            content = check;
          }
        } catch (error) {
          return next(new NotFoundError("Report update failed", error));
        }
        break;
      case "Comment":
        try {
          let check = await CommentService.findCommentById(contentId);
          if (!check) {
            return res
              .status(400)
              .json({ error: `Reported ${ref.toLowerCase()} doesn't exist.` });
          } else {
            content = check;
          }
        } catch (error) {
          return next(new NotFoundError("Report update failed", error));
        }
        break;
      case "Idea":
        try {
          let check = await CommentService.findCommentById(contentId);
          if (!check) {
            return res
              .status(400)
              .json({ error: `Reported ${ref.toLowerCase()} doesn't exist.` });
          } else {
            content = check;
          }
        } catch (error) {
          return next(new NotFoundError("Report update failed", error));
        }
        break;
      case "Message":
        try {
          let check = await MessageService.findMessageById(contentId);
          if (!check) {
            return res
              .status(400)
              .json({ error: `Reported ${ref.toLowerCase()} doesn't exist.` });
          } else {
            content = check;
          }
        } catch (error) {
          return next(new NotFoundError("Report update failed", error));
        }
      default:
        break;
    }

    const doesReportExist = await ReportService.findReportByContentId(
      contentId
    );
    if (doesReportExist) {
      if (doesReportExist.by.includes(by))
        return res
          .status(400)
          .json({ error: "You already reported this content." });

      let id = doesReportExist._id;
      let count = doesReportExist.reportCount + 1;
      doesReportExist.description.push(description);
      doesReportExist.by.push(by);
      let data = {
        reportCount: count,
        description: doesReportExist.description,
        by: doesReportExist.by,
      };
      try {
        return res.json(await ReportService.updateReport(id, data));
      } catch (error) {
        return next(new NotFoundError("Report update failed", error));
      }
    }

    const newReport = new Report({
      by,
      ref,
      targetedUserId,
      contentId,
      content,
      description: [description],
    });
    const report: any = await ReportService.createReport(newReport);
    await UserService.addReportToUser(targetedUserId, report._id);
    return res.json(report);
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return next(new BadRequestError("Invalid Request", error));
    } else {
      return next(new InternalServerError("Internal Server Error", error));
    }
  }
};

export const findAllReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json(await ReportService.findAllReports());
  } catch (error) {
    return next(new NotFoundError("Reports not found", error));
  }
};

export const findReportById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    return res.json(await ReportService.findReportById(id));
  } catch (error) {
    return next(new NotFoundError("Report not found", error));
  }
};

export const findAssignedReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { assignedTo } = req.params;
  try {
    return res.json(await ReportService.findAssignedReports(assignedTo));
  } catch (error) {
    return next(new NotFoundError("Reports not found", error));
  }
};

export const findReportsByRef = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { ref } = req.params;

  const refArr = ["user", "comment", "message", "idea"];
  if (!refArr.includes(ref.toLowerCase())) {
    let error = "The reference type is invalid.";
    return next(new BadRequestError("Invalid Request", error));
  }
  try {
    // capitalize if it isn't like that
    ref = ref[0].toUpperCase() + ref.slice(1);
    return res.json(await ReportService.findReportsByRef(ref));
  } catch (error) {
    return next(new NotFoundError("Reports not found", error));
  }
};

export const updateReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  let { status } = req.body;
  let data = { status: status };

  let statuses = ["new", "pending", "closed"];
  if (data.status && !statuses.includes(data.status)) {
    return res
      .status(400)
      .json({ error: `Status "${data.status}" is not a valid option.` });
  }

  let inputCheck = inputObjectCheck(data);
  if (inputCheck) return res.status(400).json({ error: inputCheck });

  try {
    return res.json(await ReportService.updateReport(id, data));
  } catch (error) {
    return next(new NotFoundError("Report not found", error));
  }
};

export const assignReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { reportId, userId } = req.params;
  let data = {
    assignedTo: userId,
  };

  try {
    let user = await UserService.findOneUser(userId);
    if (!user) {
      return next(new NotFoundError("User not found"));
    }
    //check if user is an admin
    if (!user.login.admin) {
      let error = {
        error: "This user you are trying to assign to is not an admin.",
      };
      return res.status(400).json(error);
    }
    return res.json(await ReportService.updateReport(reportId, data));
  } catch (error) {
    return next(new NotFoundError("Report not found", error));
  }
};

export const deleteReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  try {
    const report = await ReportService.deleteReport(id);
    if (report) {
      await UserService.removeReportFromUser(report.targetedUserId, id);
      return res.json(report);
    } else {
      throw new Error("Report not found.");
    }
  } catch (error) {
    return next(new NotFoundError("Report not found", error));
  }
};
