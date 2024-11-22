import express from "express";
import fileUpload from "express-fileupload";

import userRouter from "./routes/userRouter.js";
import { dbConnection } from "./database/connection.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

const PORT = 4000;

dotenv.config({ path: "./.env" });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
cloudinary.config({
  cloud_name: "dide16ilx",
  api_key: "379792494121579",
  api_secret: "Ck2AAnhDcR9MIdTNONwfqUts9VM",
});

app.use(
  cors({
    // origin: [process.env.FRONTEND, process.env.DASHBOARD],
    origin: "*",

    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/v1/user", userRouter);

dbConnection();

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});

export default app;
