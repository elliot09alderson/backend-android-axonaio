import jwt from "jsonwebtoken";
export const isAuthenticatedUser = async (req, res, next) => {
  // const { customerToken } = req.cookies;
  const { accessToken } = req.cookies;
  if (!accessToken) {
    return res.status(409).json({ error: "Please login first" });
  } else {
    try {
      const deCodeToken = await jwt.verify(accessToken, process.env.SECRET);
      req.role = deCodeToken.role || "user";
      req.id = deCodeToken.id;
      next();
    } catch (error) {
      return res.status(409).json({ error: "Please login" });
    }
  }
};
