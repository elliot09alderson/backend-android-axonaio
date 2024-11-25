import express from "express";

import {
  deleteUser,
  getAllUser,
  adminDetails,
  getApps,
} from "../controller/adminController.js";
import { isAuthenticatedAdmin } from "../middlewares/isAuthenticatedAdmin.js";
import {
  adminLogin,
  adminLogout,
  registerAdmin,
  verifyAdminLoginOtp,
  verifyAdminOtp,
} from "../controller/authController.js";
const adminRouter = express.Router();
// ________________ APPS __________________

adminRouter.post("/apps", getApps);

// _________________________________________
adminRouter.post("/", registerAdmin);
adminRouter.post("/verify", verifyAdminOtp);
adminRouter.post("/login", adminLogin);
adminRouter.post("/login/verify", verifyAdminLoginOtp);
adminRouter.post("/logout", adminLogout);
adminRouter.get("/", isAuthenticatedAdmin, adminDetails);
adminRouter.get("/user/all/", isAuthenticatedAdmin, getAllUser);
adminRouter.delete("/user/:id", deleteUser);

export default adminRouter;
