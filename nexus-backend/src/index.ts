import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import mainRouter from "./routers";
import { errorHandler } from "./middlewares/error_handler";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.ALLOW_ORIGIN!],
    credentials: true,
  }),
);
app.use(morgan("dev"));

app.use("", mainRouter);

// Must be registered last — catches any error passed to next(err)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
