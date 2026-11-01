import prisma from "../config/prisma.js";

export function requireRole(...roles) {
  return async function (req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { cognitoUid: req.user.sub },
      });

      if (!user || !roles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Not authorized for this role" });
      }

      req.currentUser = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}
