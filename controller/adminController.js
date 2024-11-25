import { Admin } from "../models/adminModel.js";

export const getAllUser = async (req, res) => {
  try {
    const users = await Admin.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const adminDetails = async (req, res) => {
  try {
    console.log(req.id);
    const users = await Admin.findById(req.id);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const user = await Admin.findByIdAndDelete(req.params.id).select(
      "-password"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// _________________________________________________________

export const getApps = async (req, res) => {
  try {
    const users = await Apps.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};