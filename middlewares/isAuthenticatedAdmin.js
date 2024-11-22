import jwt from "jsonwebtoken";
export const isAuthenticatedAdmin = async (req, res, next) => {
  // const { customerToken } = req.cookies;
  const { adminToken } = req.cookies;
  console.log(req.cookies.adminToken);
  if (!adminToken) {
    return res.status(409).json({ error: "Please login first" });
  } else {
    try {
      const deCodeToken = await jwt.verify(
        adminToken,
        process.env.ADMIN_SECRET
      );

      // console.log("deCodeToken.......", deCodeToken);
      req.role = deCodeToken.role;
      req.id = deCodeToken.id;
      next();
    } catch (error) {
      return res.status(409).json({ error: "Please login" });
    }
  }
};
