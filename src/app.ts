/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import path from "path"; // Import path module for resolving paths
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorhandler";
import notFound from "./app/middlewares/notFound";
import { privateAccessMiddleware } from "./app/middlewares/privateFileAccess";
import auth from "./app/middlewares/auth";
import { USER_ROLE } from "./app/module/User/user.constant";

const app: Application = express();

app.use(cors({
  origin: ["https://camp-pro-shop.shuvobaroi.com", "http://localhost:5173", "https://camp-pro-shop.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

app.options("*", cors());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Secure the /uploads/users directory with auth middleware
app.use('/uploads/users', auth(USER_ROLE?.admin, USER_ROLE?.customer), privateAccessMiddleware, express.static(path.join(process.cwd(), '../uploads/users')));

// Public files route without any restriction
app.use('/uploads/public', express.static(path.join(process.cwd(), '../uploads/public')));

app.use("/api/v1", router); // /api/v1 will prefix all the routes

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Camp Pro Shop!");
});

app.use(globalErrorHandler); // This is connected with the globalErrorhandler.ts file at the middleware folder.

app.use(notFound); // This is connected with the notFound.ts file at the middleware folder.

export default app;
