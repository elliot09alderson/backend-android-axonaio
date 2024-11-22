import express from "express";

import {
  registerUser,
  resendPhoneOtp,
  sendLoginPhoneOTP,
  deleteuser,
  setPassword,
  userPhoneLogout,
  verifyLoginPhoneOtp,
  verifyRegisterationPhoneOtp,
} from "../controller/authController.js";
// import { isAuthenticatedUser } from "../middlewares/isAuthenticatedUser.js";

export const userRouter = express.Router();

userRouter.post("/logout", userPhoneLogout);
userRouter.post("/login/send-otp", sendLoginPhoneOTP);
userRouter.post("/login/verify-otp", verifyLoginPhoneOtp);


//____________REGISTER ___________
userRouter.post("/send-otp", registerUser);
userRouter.post("/verify-otp", verifyRegisterationPhoneOtp);
userRouter.post("/set-password", setPassword);
userRouter.post("/resend-otp", resendPhoneOtp);
userRouter.delete("/:id", deleteuser);

// userRouter.get("/", isAuthenticatedUser, getUserDetails);

// userRouter.put("/:id", editUser);

export default userRouter;