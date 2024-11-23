import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import __dirname from "./utils/directoryname.js";
import cookieParser from "cookie-parser";
import commonRouter from "./routes/common.routes.js";
dotenv.config({ path: "./.env" });

// Initializing
const app = express();

// Enabling CORS
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// Public folder to serve files
app.use("/static", express.static(path.join(__dirname, "public")));

// IIFE to connect to MONGODB and listen to the server
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("MONGO_DB connected successfully");
    app.listen(process.env.PORT, () => {
      console.log(`Server listening on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();

app.use("/", commonRouter);

// app.use('/doctor', )
// app.use('/patient', )
