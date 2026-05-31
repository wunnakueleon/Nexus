import { createServer } from "http";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import mainRouter from "./routers";
import { errorHandler } from "./middlewares/error_handler";
import { initRealtime } from "./realtime/io";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN!;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [ALLOW_ORIGIN],
    credentials: true,
  }),
);
app.use(morgan("dev"));

app.use("", mainRouter);

// Must be registered last — catches any error passed to next(err)
app.use(errorHandler);

// Wrap Express in a bare HTTP server so Socket.IO can share the same port.
const server = createServer(app);
initRealtime(server, ALLOW_ORIGIN);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
