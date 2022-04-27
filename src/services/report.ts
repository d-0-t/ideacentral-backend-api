import Report, { ReportDocument } from "../models/Report";

async function createReport(Report: ReportDocument): Promise<ReportDocument> {
  return Report.save();
}

async function findReportById(id: string): Promise<ReportDocument | null> {
  const report = await Report.findById(id).populate({
    path: "by",
    select: "login.username",
  });
  return report;
}

async function findReportByContentId(
  contentId: string
): Promise<ReportDocument | null> {
  return Report.findOne({ contentId }).populate({
    path: "by",
    select: "login.username",
  });
}

async function findReportByReporter(
  by: string
): Promise<ReportDocument | null> {
  return Report.findOne({ by }).populate({
    path: "by",
    select: "login.username",
  });
}

async function findReportsByRef(ref: string): Promise<ReportDocument[] | null> {
  let validRefs = ["User", "Comment", "Message", "Idea"];
  if (!validRefs.includes(ref)) return null;
  //@ts-ignore
  return Report.find({ ref }).populate({
    path: "by",
    select: "login.username",
  });
}

async function findAllReports(): Promise<ReportDocument[]> {
  return Report.find().populate({
    path: "by",
    select: "login.username",
  });
}

async function findAssignedReports(
  assignedTo: string
): Promise<ReportDocument[]> {
  return Report.find({ assignedTo }).populate({
    path: "by",
    select: "login.username",
  });
}

async function findNewReports(): Promise<ReportDocument[]> {
  return Report.find({ status: "new" }).populate({
    path: "by",
    select: "login.username",
  });
}

async function updateReport(
  id: string,
  data: any
): Promise<ReportDocument | null> {
  return await Report.findByIdAndUpdate(id, data, { new: true }).populate({
    path: "by",
    select: "login.username",
  });
}

async function deleteReport(id: string): Promise<ReportDocument | null> {
  const report = Report.findByIdAndDelete(id);
  return report;
}

export default {
  createReport,
  findReportById,
  findReportByContentId,
  findReportByReporter,
  findReportsByRef,
  findAllReports,
  findAssignedReports,
  deleteReport,
  updateReport,
  findNewReports,
};
