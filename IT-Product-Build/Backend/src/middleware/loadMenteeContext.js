import prisma from "../config/prisma.js";

export async function loadMenteeContext(req, res, next) {
  try {
    const profile = await prisma.menteeProfile.findUnique({
      where: { userId: req.currentUser.id },
    });

    if (!profile) {
      return res
        .status(403)
        .json({ message: "No mentee profile exists for this account" });
    }

    const mentorship = await prisma.mentorship.findFirst({
      where: {
        menteeProfileId: profile.id,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
      orderBy: { startedAt: "desc" },
      include: {
        mentorProfile: {
          include: {
            user: { select: { displayName: true } },
          },
        },
      },
    });

    req.mentee = { user: req.currentUser, profile, mentorship };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireActiveMentorship(req, res, next) {
  if (!req.mentee?.mentorship) {
    return res.status(409).json({ message: "No active mentorship" });
  }
  next();
}
