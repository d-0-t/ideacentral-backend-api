import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import userRouter from "./routers/user";
import tagRouter from "./routers/tag";
import reportRouter from "./routers/report";
import messageRouter from "./routers/message";
import ideaRouter from "./routers/idea";
import commentRouter from "./routers/comment";

import apiErrorHandler from "./middlewares/apiErrorHandler";
import apiContentType from "./middlewares/apiContentType";

import passport from "passport";
import { jwtStrategy } from "./config/passport";

dotenv.config({ path: ".env" });
const app = express();

// Express configuration
app.use(apiContentType);
// Use common 3rd-party middlewares
app.use(express.json());
app.use(cors());

passport.use(jwtStrategy);

app.use("/api/v1/users/", userRouter);
app.use("/api/v1/tags/", tagRouter);
app.use("/api/v1/reports/", reportRouter);
app.use("/api/v1/messages/", messageRouter);
app.use("/api/v1/ideas/", ideaRouter);
app.use("/api/v1/comments/", commentRouter);

// Custom API error handler
app.use(apiErrorHandler);

export default app;
