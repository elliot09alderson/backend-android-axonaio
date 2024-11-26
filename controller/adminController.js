import { Admin } from "../models/adminModel.js";
import { AppsModel } from "../models/appsModel.js";
import { uploadImage, uploadImages } from "../utils/uploadImages.js";

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
    return res
      .status(200)
      .json({ status: 200, apps: apps.length > 0 ? apps[0] : apps });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const createHomeAppsAndBanner = async (req, res) => {
  try {
    const { category, name, url } = req.body;
    if (!req.files.image) {
      return res.status(400).json({
        success: false,
        message: "At least one image file is required!",
      });
    }
    const image = req.files.image;
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

    const uploadResponse = await uploadImage("apps", image);
    console.log(uploadResponse.url);

    const logo = uploadResponse.url;

    // Add to the correct category
    switch (category) {
      case "travelApps":
        appData.travelApps.push({
          travelAppName: name,
          travelAppLogo: logo,
          travelAppUrl: url,
        });
        break;
      case "insuranceApps":
        appData.insuranceApps.push({
          insuranceAppName: name,
          insuranceAppLogo: logo,
          insuranceAppUrl: url,
        });
        break;
      case "moneyTransferApps":
        appData.moneyTransferApps.push({
          moneyTransferAppName: name,
          moneyTransferAppLogo: logo,
          moneyTransferAppUrl: url,
        });
        break;

      case "rechargeAndBillsApps":
        appData.rechargeAndBillApps.push({
          rechargeAppName: name,
          rechargeAppLogo: logo,
          rechargeAppUrl: url,
        });
        break;

      case "banners":
        appData.banners.push({ bannerImageUrl: logo, bannerLink: url });
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
