import * as mentorshipService from "../services/mentorshipService.js";
import { getPendingPauseRequest } from "../services/pauseRequestService.js";
import { getTolerance as getToleranceForMentorship } from "../services/toleranceService.js";
import * as menteeProfileService from "../services/menteeProfileService.js";
import { scoreMentor } from "../services/matching/scoreMentor.js";
import { toMentorCard } from "../services/matching/mentorCard.js";
import { currentWeekNumber } from "../utils/weeks.js";

const MAX_REQUEST_MESSAGE_LENGTH = 300;

export async function updateOnboarding(req, res, next) {
  try {
    const updated = await menteeProfileService.updateOnboarding(
      req.mentee.profile,
      req.body,
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await menteeProfileService.updateProfilePatch(
      req.mentee.profile.id,
      req.body,
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function getTolerance(req, res, next) {
  try {
    const result = await getToleranceForMentorship(req.mentee.mentorship);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const { user, profile } = req.mentee;

    res.json({
      id: user.id,
      displayName: user.displayName,
      syntheticEmail: user.syntheticEmail,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      menteeProfile: profile,
    });
  } catch (err) {
    next(err);
  }
}

export async function createRequest(req, res, next) {
  try {
    const { mentorProfileId, message } = req.body;

    if (req.mentee.profile.field == null) {
      return res
        .status(409)
        .json({ message: "Complete onboarding before requesting a mentor" });
    }
    if (typeof mentorProfileId !== "string" || mentorProfileId.length === 0) {
      return res.status(400).json({ message: "mentorProfileId is required" });
    }
    if (message != null && typeof message !== "string") {
      return res.status(400).json({ message: "message must be a string" });
    }
    if (message != null && message.length > MAX_REQUEST_MESSAGE_LENGTH) {
      return res.status(400).json({
        message: `message must be ${MAX_REQUEST_MESSAGE_LENGTH} characters or fewer`,
      });
    }

    const request = await mentorshipService.createRequest(
      req.mentee.profile.id,
      mentorProfileId,
      message,
    );

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

export async function listRequests(req, res, next) {
  try {
    const requests = await mentorshipService.listMenteeRequests(
      req.mentee.profile.id,
    );

    res.json(
      requests.map((r) => ({
        id: r.id,
        mentorProfileId: r.mentorProfileId,
        mentorName: r.mentorProfile.user.displayName,
        status: r.status,
        createdAt: r.createdAt,
        respondedAt: r.respondedAt,
      })),
    );
  } catch (err) {
    next(err);
  }
}

export async function withdrawRequest(req, res, next) {
  try {
    const request = await mentorshipService.withdrawRequest(
      req.mentee.profile.id,
      req.params.id,
    );

    res.json(request);
  } catch (err) {
    next(err);
  }
}

export async function startNow(req, res, next) {
  try {
    const result = await mentorshipService.startMentorshipNow(
      req.mentee.profile.id,
      req.params.id,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMentorship(req, res, next) {
  try {
    const { mentorship } = req.mentee;

    if (!mentorship) {
      return res.json(null);
    }

    const { mentorProfile, weeksLogged, trackRecord } =
      await mentorshipService.getMenteeMentorshipDetail(mentorship);

    const scoreResult = scoreMentor(req.mentee.profile, mentorProfile);
    const matchScore = mentorship.matchScore ?? scoreResult.score;
    const card = toMentorCard(mentorProfile, { ...scoreResult, score: matchScore }, null, {
      withBio: true,
      trackRecord,
    });
    const pendingPauseRequest = await getPendingPauseRequest(mentorship.id);

    res.json({
      id: mentorship.id,
      status: mentorship.status,
      startedAt: mentorship.startedAt,
      weekNumber: currentWeekNumber(mentorship.startedAt),
      weeksLogged,
      chatRoomUrl: mentorship.chatRoomUrl,
      matchScore,
      pendingPauseRequest,
      mentor: card,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOverview(req, res, next) {
  try {
    const stats = await mentorshipService.getMenteeOverviewStats(
      req.mentee.profile.id,
      req.mentee.mentorship,
    );

    res.json(stats);
  } catch (err) {
    next(err);
  }
}
