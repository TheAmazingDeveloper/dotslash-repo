import { Router } from "express";
import multerFileUpload from "../middleware/multer.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controller/common.controller.js";
const commonRouter = Router();
commonRouter.post(
  "/auth/register",
  multerFileUpload.single("avatar"),
  registerUser
);
commonRouter.post("/auth/login", loginUser);
commonRouter.get("/auth/logout", logoutUser);

export default commonRouter;
