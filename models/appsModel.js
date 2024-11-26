import mongoose from "mongoose";
const rechargeAndBillsAppSchema = new mongoose.Schema(
  {
    rechargeAppName: { type: String, required: true },
    rechargeAppLogo: { type: String, required: true },
    rechargeAppUrl: { type: String, required: true },
  },
  { timestamps: true }
);
const insuranceAppSchema = new mongoose.Schema(
  {
    insuranceAppName: { type: String, required: true },
    insuranceAppLogo: { type: String, required: true },
    insuranceAppUrl: { type: String, required: true },
  },
  { timestamps: true }
);
const travelAppSchema = new mongoose.Schema(
  {
    travelAppName: { type: String, required: true },
    travelAppLogo: { type: String, required: true },
    travelAppUrl: { type: String, required: true },
  },
  { timestamps: true }
);
const bannerSchema = new mongoose.Schema(
  {
    bannerImageUrl: { type: String, required: true },
    bannerLink: { type: String, required: false },
  },
  { timestamps: true }
);

const moneyTransferAppSchema = new mongoose.Schema(
  {
    moneyTransferAppName: { type: String, required: true },
    moneyTransferAppLogo: { type: String, required: true },
    moneyTransferAppUrl: { type: String, required: true },
  },
  { timestamps: true }
);
const appsSchema = new mongoose.Schema(
  {
    moneyTransferApps: [moneyTransferAppSchema],
    banners: [bannerSchema],
    travelApps: [travelAppSchema],
    insuranceApps: [insuranceAppSchema],
    rechargeAndBillApps: [rechargeAndBillsAppSchema],
  },
  { timestamps: true }
);

export const AppsModel = mongoose.model("Apps", appsSchema);
