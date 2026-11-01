import prisma from "../config/prisma.js";

export async function loadMentorshipParticipant(req, res, next) {
  try {
    const mentorship = await prisma.mentorship.findUnique({
      where: { id: req.params.mentorshipId },
      include: {
        menteeProfile: { select: { userId: true } },
        mentorProfile: { select: { userId: true } },
      },
    });

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    let side;
    if (mentorship.menteeProfile.userId === req.currentUser.id) {
      side = "MENTEE";
    } else if (mentorship.mentorProfile.userId === req.currentUser.id) {
      side = "MENTOR";
    } else {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    req.participant = { user: req.currentUser, side, mentorship };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireMentorSide(req, res, next) {
  if (req.participant.side !== "MENTOR") {
    return res.status(404).json({ message: "Mentorship not found" });
  }
  next();
}

export function requireOpenMentorship(req, res, next) {
  if (req.participant.mentorship.status === "ENDED") {
    return res.status(409).json({ message: "Mentorship has ended" });
  }
  next();
}
