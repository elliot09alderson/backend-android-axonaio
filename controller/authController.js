import { createAdminToken, createUserToken } from "../utils/generateToken.js";
import { uploadImages } from "../utils/uploadImages.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Admin } from "../models/adminModel.js";
import { User } from "../models/userModel.js";
import { sendOTP } from "../utils/sendPhoneOTP.js";
import bcrypt from "bcryptjs";

export async function registerAdmin(req, res) {
  try {
    const { email, username, password } = req.body;
    const isUserExist = await Admin.findOne({ email });
    if (isUserExist) {
      return res
        .status(400)
        .json({ message: "user already exist please login !" });
    }
    if (!email || !username || !password) {
      return res.status(400).json({
        message: "please provide all details username , email , passowrd",
      });
    }

    if (!req.files || !req.files.avatar) {
      return res.status(400).json({
        success: false,
        message: "At least one avatar file is required!",
      });
    }

    const avatars = Array.isArray(req.files.avatar)
      ? req.files.avatar
      : [req.files.avatar];

    const uploadResponses = await uploadImages("avatar", avatars);

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const admin = new Admin({
      email,
      password,
      username,
      otp,
      otpExpiry,
      avatar: uploadResponses,
    });
    await admin.save();

    await sendEmail(
      email,
      "Login OTP from Axonpay",
      { name: username, otp: otp },
      "./template/welcome.handlebars"
    );
    console.log("email sent");
    return res.json({
      success: true,
      admin,
      message: "Admin registered. Please verify your email with the OTP.",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
}
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    // console.log(req.body);
    if (!email || !password) {
      return res.status(400).json({
        message: "please provide all details email, passowrd",
      });
    }
    const isUserExist = await Admin.findOne({ email });
    if (!isUserExist) {
      return res.status(400).json({ message: "invalid email password !" });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const user = await Admin.findOneAndUpdate(
      {
        email,
      },
      {
        otp,
        otpExpiry,
      },
      { new: true }
    ).select("-password");
    await user.save();

    await sendEmail(
      email,
      "Login OTP from Axonpay",
      { name: user.username, otp: otp },
      "./template/welcome.handlebars"
    );
    console.log("email sent");
    return res.json({
      success: true,
      user,
      message: "Please verify your email with the OTP.",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
}
export async function verifyAdminOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const user = await Admin.findOne({ email });

    if (!user || user.isVerified) {
      return res.json({
        success: false,
        message: "User not found or already verified",
      });
    }

    if (Number(user.otp) !== Number(otp) || user.otpExpiry < new Date()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = await createAdminToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    return res
      .cookie("adminToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
}
export async function adminLogout(req, res) {
  try {
    return res
      .cookie("adminToken", "", {
        expires: new Date(0), // Set expiration to a past date to clear the cookie
        httpOnly: true, // Ensures the cookie is only accessible via HTTP(S)
        secure: true, // Use `secure: true` if you're using HTTPS
        sameSite: "strict", // Add SameSite policy for security
      })
      .json({ success: true, message: "ADMIN logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
}
export async function verifyAdminLoginOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.json({
        success: false,
        message: "Un-authorized Access !",
      });
    }

    if (Number(admin.otp) !== Number(otp) || admin.otpExpiry < new Date()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    admin.isVerified = true;
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    const token = await createAdminToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });
    return res
      .cookie("adminToken", token, {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      })
      .json({
        success: true,
        message: `ADMIN ${admin.username} logged in successfully`,
      });
  } catch (error) {
    return res.json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
}
// _______________________  | MOBILE |   ___________________________

export async function sendLoginPhoneOTP(req, res) {
  try {
    const { phonenumber } = req.body;
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 30 * 1000); // 5 minutes from now

    let user = await User.findOne({ phonenumber });
    if (!user) return res.status(404).json({ message: "User not registered" });
    if (!user.isRegistered)
      return res
        .status(401)
        .json({ message: "please complete your registeration" });

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();
    const smsResponse = await sendOTP(phonenumber, otp);
    res.json({
      success: true,
      message: "we have sent login otp to your number",
    });
    console.log("SMS sent successfully:", smsResponse);
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
}
export async function registerUser(req, res) {
  try {
    const { phonenumber } = req.body;
    if (!phonenumber) {
      return res.status(400).json({
        message: "please provide phonenumber",
      });
    }
    const isUserExist = await User.findOne({ phonenumber });
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 30 * 1000); // OTP valid for 30 sec
    if (isUserExist) {
      await User.findOneAndUpdate(
        { phonenumber },
        {
          otp,
          otpExpiry,
        }
      );
      const smsResponse = await sendOTP(phonenumber, otp);
      console.log("SMS sent successfully:", smsResponse);

      return res
        .status(200)
        .json({ message: "Please verify your number with OTP" });
    }

    const user = new User({
      phonenumber,
      otp,
      otpExpiry,
    });
    await user.save();

    // _____SEND OTP TO PHONENUMBER ____

    const smsResponse = await sendOTP(phonenumber, otp);
    console.log("SMS sent successfully:", smsResponse);

    return res.json({
      success: true,
      user,
      message: "Please verify your number with the OTP.",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
}

export const resendPhoneOtp = async (req, res) => {
  const { phonenumber } = req.body;
  if (!phonenumber)
    return res.status(400).json({ message: "Phone number is required" });

  try {
    const user = await User.findOne({ phonenumber });
    if (!user) return res.status(404).json({ message: "User not registered" });

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Simulate sending OTP (e.g., via SMS API)
    const smsResponse = await sendOTP(phonenumber, otp);
    console.log("SMS sent successfully:", smsResponse);

    console.log(`OTP resent to ${phonenumber}: ${otp}`);

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error resending OTP", error });
  }
};
export const verifyLoginPhoneOtp = async (req, res) => {
  const { phonenumber, otp } = req.body;
  if (!phonenumber || !otp)
    return res
      .status(400)
      .json({ message: "Phonenumber and OTP are required" });

  try {
    const user = await User.findOne({ phonenumber });

    if (!user.optVerified) {
      return res.status(400).json({
        success: false,
        message: "please complete your registeration first",
      });
    }
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "please complete your pin registeration first",
      });
    }
    if (
      !user ||
      Number(user.otp) !== Number(otp) ||
      user.otpExpiry < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otp = null; // Clear OTP after successful verification
    user.otpExpiry = null;

    await user.save();
    const token = await createUserToken({
      id: user._id,
      phonenumber: user.phonenumber,
    });
    return res
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error verifying OTP", error });
  }
};

export const verifyRegisterationPhoneOtp = async (req, res) => {
  const { phonenumber, otp } = req.body;
  if (!phonenumber || !otp)
    return res
      .status(400)
      .json({ message: "Phonenumber and OTP are required" });

  try {
    const user = await User.findOne({ phonenumber });

    if (
      !user ||
      Number(user.otp) !== Number(otp) ||
      user.otpExpiry < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otp = null; // Clear OTP after successful verification
    user.otpExpiry = null;
    user.optVerified = true;
    user.isRegistered = true;
    await user.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error verifying OTP", error });
  }
};

export const setPassword = async (req, res) => {
  const { phonenumber, password, confirmPassword } = req.body;
  if (!phonenumber || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({ phonenumber });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!user.optVerified)
      return res.status(404).json({
        success: false,
        message: "number not verified, Please complete your registeration",
      });
    if (user.password)
      return res.status(401).json({
        success: false,
        message: "pincode already set please forget picode",
      });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    const token = await createUserToken({
      id: user._id,
      phonenumber: user.phonenumber,
    });
    return res
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({ success: true, message: "Password set successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error setting password",
      error: error.message,
    });
  }
};
export async function userPhoneLogout(req, res) {
  try {
    return res
      .cookie("accessToken", "", {
        expires: new Date(0), // Set expiration to a past date to clear the cookie
        httpOnly: true, // Ensures the cookie is only accessible via HTTP(S)
        secure: true, // Use `secure: true` if you're using HTTPS
        sameSite: "strict", // Add SameSite policy for security
      })
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
}
export async function deleteuser(req, res) {
  const { id } = req.params;

  const deletedUser = await User.findById(id);
  if (!deletedUser) {
    res.json({ success: false, message: "User not deleted  " });
  }
  try {
    return res
      .cookie("accessToken", "", {
        expires: new Date(0), // Set expiration to a past date to clear the cookie
        httpOnly: true, // Ensures the cookie is only accessible via HTTP(S)
        secure: true, // Use `secure: true` if you're using HTTPS
        sameSite: "strict", // Add SameSite policy for security
      })
      .json({ success: true, message: "User deleted  successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
}
// _________________________________________________

export async function userLogin(req, res) {
  try {
    const {} = req.body;
    // console.log(req.body);
    if (!email || !password) {
      return res.status(400).json({
        message: "please provide all details email, passowrd",
      });
    }
    const isUserExist = await User.findOne({ email });
    if (!isUserExist) {
      return res.status(400).json({ message: "invalid email password !" });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const user = await User.findOneAndUpdate(
      {
        email,
      },
      {
        otp,
        otpExpiry,
      },
      { new: true }
    ).select("-password");
    await user.save();

    await sendEmail(
      email,
      "Login OTP from Axonpay",
      { name: user.username, otp: otp },
      "./template/welcome.handlebars"
    );
    console.log("email sent");
    return res.json({
      success: true,
      user,
      message: "Please verify your email with the OTP.",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
}
export async function userLogout(req, res) {
  try {
    return res
      .cookie("accessToken", "", {
        expires: new Date(0), // Set expiration to a past date to clear the cookie
        httpOnly: true, // Ensures the cookie is only accessible via HTTP(S)
        secure: true, // Use `secure: true` if you're using HTTPS
        sameSite: "strict", // Add SameSite policy for security
      })
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
}
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.json({
        success: false,
        message: "User not found or already verified",
      });
    }

    if (Number(user.otp) !== Number(otp) || user.otpExpiry < new Date()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = await createUserToken({
      id: user._id,
      email: user.email,
      role: "user",
    });
    return res
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
}

export async function verifyLoginOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found or already verified",
      });
    }

    if (Number(user.otp) !== Number(otp) || user.otpExpiry < new Date()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = await createUserToken({
      id: user._id,
      email: user.email,
      role: "user",
    });
    return res
      .cookie("accessToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({ success: true, message: "User logged in successfully" });
  } catch (error) {
    return res.json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
}
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}
