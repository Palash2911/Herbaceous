import prisma from "../config/prisma.js";
import * as mentorshipService from "../services/mentorshipService.js";

export async function getCurrent(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { cognitoUid: req.user.sub },
      include: { menteeProfile: true, mentorProfile: true },
    });

    if (!user || (!user.menteeProfile && !user.mentorProfile)) {
      return res.status(403).json({ message: "No profile exists for this account" });
    }

    const mentorship = await mentorshipService.getCurrentMentorship({
      menteeProfileId: user.menteeProfile?.id,
      mentorProfileId: user.mentorProfile?.id,
    });

    res.json(mentorship);
  } catch (err) {
    next(err);
  }
}
