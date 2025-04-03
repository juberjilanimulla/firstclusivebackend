import express from "express";
import config from "./config.js";
import dbConnect from "./db.js";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import clientRouter from "./routes/client/clientRouter.js";
import adminRouter from "./routes/admin/adminRouter.js";
import authRouter from "./routes/auth/authRouter.js";
import {
  Admin,
  authMiddleware,
  isAdminMiddleware,
} from "./helpers/helperFunction.js";

const app = express();
const port = config.PORT;
const prod = config.PRODDEV === "prod";

app.set("trust proxy", true);
morgan.token("remote-addr", function (req) {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
});

morgan.token("url", (req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return req.originalUrl;
});

app.use(
  morgan(
    ":remote-addr :method :url :status :res[content-length] - :response-time ms"
  )
);

//middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "10mb" }));

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON input" });
  }
  next(err); // Pass to the next middleware if not a JSON error
});

// Default error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.use("/api/pdf", authMiddleware, express.static("./pdfs"));
app.use("/api/client", clientRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/uploads", express.static("./uploads"));

if (prod) {
  app.use("/", express.static(config.FRONTEND_PATH));
  app.get("/*", (req, res) => {
    res.sendFile("index.html", { root: config.FRONTEND_PATH });
  });

  console.log("staring production server");
}

app.use("*", (req, res) => {
  res.status(403).json({
    message: "not found",
  });
});

dbConnect()
  .then(() => {
    Admin();
    app.listen(port, () => {
      console.log(`server is listening at ${port}`);
    });
  })
  .catch((error) => {
    console.log("error connecting server", error);
  });
