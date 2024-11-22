const rechargeAndBillsAppSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);
const bannerSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    link: { type: String, required: false },
  },
  { timestamps: true }
);

const moneyTransferAppSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);
const appsSchema = new mongoose.Schema(
  {
    moneyTransferApps: [moneyTransferAppSchema],
    banners: [bannerSchema],
    rechargeAndBillsApps: [rechargeAndBillsAppSchema],
  },
  { timestamps: true }
);

const AppsModel = mongoose.model("Apps", appsSchema);
