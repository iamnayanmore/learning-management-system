import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";

config({ path: "./config/config.env" });
const app = express();

// importing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Importing and use routes
import user from "./routes/userRoute.js";
import course from "./routes/courseRoute.js";

app.use("/api/v1", user);
app.use("/api/v1", course);

export default app;
app.use(ErrorMiddleware);
