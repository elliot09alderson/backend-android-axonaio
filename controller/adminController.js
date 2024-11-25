import { Admin } from "../models/adminModel.js";
import { AppsModel } from "../models/appsModel.js";

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

// _____________________ APPS ____________________________________

export const getApps = async (req, res) => {
  try {
    const apps = await AppsModel.find();
    return res.status(200).json({ status: 200, apps });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const createHomeAppsAndBanner = async (req, res) => {
  try {
    const { category, name, logo, url, imageUrl, link } = req.body;

    // Find the document
    let appData = await AppsModel.findOne();

    // If the document doesn't exist, create one
    if (!appData) {
      appData = new AppsModel({
        moneyTransferApps: [],
        banners: [],
        rechargeAndBillsApps: [],
      });
    }

    // Add to the correct category
    switch (category) {
      case "moneyTransferApps":
        appData.moneyTransferApps.push({ name, logo, url });
        break;

      case "rechargeAndBillsApps":
        appData.rechargeAndBillsApps.push({ name, icon: logo, url });
        break;

      case "banners":
        appData.banners.push({ imageUrl, link });
        break;

      default:
        return res.status(400).json({ error: "Invalid category specified" });
    }

    // Save the document
    await appData.save();

    res.status(200).json({ message: "App added successfully", data: appData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the app" });
  }
};
