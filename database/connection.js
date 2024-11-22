import mongoose from "mongoose";

export const dbConnection = () => {
  console.log(`db connected on ${process.env.MONGOURI}`);
  mongoose
    .connect(process.env.MONGOURI, {
      dbName: "phoneAxonaio",
    })
    .then(() => {
      console.log("Connected to database!");
    })
    .catch((err) => {
      console.log("Some error occured while connecting to database:", err);
    });
};
