import prisma from "../config/prisma.js";

export async function loadMentorContext(req, res, next) {
  try {
    const profile = await prisma.mentorProfile.findUnique({
      where: { userId: req.currentUser.id },
    });

    if (!profile) {
      return res
        .status(403)
        .json({ message: "No mentor profile exists for this account" });
    }

    req.mentor = { user: req.currentUser, profile };
    next();
  } catch (err) {
    next(err);
  }
}
