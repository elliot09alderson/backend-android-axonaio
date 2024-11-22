import jwt from "jsonwebtoken";

export const createUserToken = async (data) => {
  const token = jwt.sign(data, process.env.SECRET, { expiresIn: "7d" });

  return token;
};
export const createAdminToken = async (data) => {
  const token = jwt.sign(data, process.env.ADMIN_SECRET, { expiresIn: "7d" });

  return token;
};
