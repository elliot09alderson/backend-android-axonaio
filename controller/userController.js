import { User } from "../models/userModel.js";
import { uploadImages } from "../utils/uploadImages.js";

export const uploadfileMultiple = async (req, res) => {
  try {
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

    const user = await User.create({ avatar: uploadResponses });

    return res.status(200).json({
      success: true,
      message: "User registered with multiple avatars",
      user,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const isUserExist = await User.findOne({ email: req.body.email });
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
    const user = new User({ ...req.body, avatar: uploadResponses });
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.id);

    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const editUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
