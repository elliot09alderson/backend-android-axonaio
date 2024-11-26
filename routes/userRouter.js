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
  resetPasswordSendOtp,
  resetPasswordVerifyOtp,
  generateUpiId,
  changePassword,
  updateDetails,
} from "../controller/authController.js";
// import { isAuthenticatedUser } from "../middlewares/isAuthenticatedUser.js";

export const userRouter = express.Router();
//____________ LOGIN ___________

userRouter.post("/logout", userPhoneLogout);
userRouter.post("/login/send-otp", sendLoginPhoneOTP);
userRouter.post("/login/verify-otp", verifyLoginPhoneOtp);
// userRouter.post("/generate-upi", generateUpiId);

//____________REGISTER ___________
userRouter.post("/send-otp", registerUser);
userRouter.post("/verify-otp", verifyRegisterationPhoneOtp);
userRouter.post("/set-password", setPassword);

//____________ PASSWORD ___________
userRouter.post("/resend-otp", resendPhoneOtp);
userRouter.post("/reset-password", resetPasswordSendOtp);
userRouter.post("/change-password", changePassword);
userRouter.post("/reset-password-verify", resetPasswordVerifyOtp);
userRouter.delete("/:id", deleteuser);
//____________ UPDATE ___________
userRouter.put("/update-profile",updateDetails)




// userRouter.get("/", isAuthenticatedUser, getUserDetails);

// userRouter.put("/:id", editUser);

export default userRouter;
