import multer from "multer";
import {
  isCredentialVerificationEnabled,
  pingVerifier,
} from "../services/credentialExtraction.js";
import {
  getVerificationStatus as fetchVerificationStatus,
  submitVerification,
} from "../services/mentorService.js";
import * as mentorProfileService from "../services/mentorProfileService.js";
import * as mentorshipService from "../services/mentorshipService.js";
import * as advocacyService from "../services/advocacyService.js";
import * as pauseRequestService from "../services/pauseRequestService.js";
import * as toleranceService from "../services/toleranceService.js";

const VALID_REQUEST_STATUSES = ["PENDING", "ACCEPTED", "DECLINED"];
const VALID_ACTIONS = ["ACCEPT", "DECLINE"];
const VALID_PAUSE_ACTIONS = ["APPROVE", "DECLINE"];
const VALID_ADVOCACY_ACTIONS = ["ACCEPT", "DECLINE", "DONE"];
const VALID_ADVOCACY_INBOX_STATUSES = ["PENDING", "ACCEPTED", "DECLINED", "DONE", "CLOSED"];
const VALID_BOOLEAN_STRINGS = ["true", "false"];
const MAX_RESPONSE_NOTE_LENGTH = 500;
const VALID_MENTORSHIP_STATUSES = ["ACTIVE", "PAUSED", "ENDED"];

const MAX_VERIFICATION_FILE_BYTES = 10 * 1024 * 1024;
const FILE_SIGNATURES = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/jpeg": [0xff, 0xd8, 0xff],
};
const ALLOWED_VERIFICATION_MIME_TYPES = Object.keys(FILE_SIGNATURES);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VERIFICATION_FILE_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_VERIFICATION_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    const err = new Error("Files must be PDF, PNG or JPEG");
    err.status = 400;
    cb(err);
  },
});

const uploadVerificationFields = upload.fields([
  { name: "resume", maxCount: 1 },
]);

export function uploadVerificationFiles(req, res, next) {
  uploadVerificationFields(req, res, (err) => {
    if (!err) {
      return next();
    }
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Files must be 10 MB or smaller" });
      }
      return res.status(400).json({ message: "Invalid file upload" });
    }
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  });
}

export function checkVerificationRequest(req, res, next) {
  if (req.body?.consent !== "true") {
    return res
      .status(400)
      .json({ message: "Consent is required to verify your credentials" });
  }
  if (req.mentor.profile.isVerified) {
    return res.status(409).json({ message: "You are already verified" });
  }
  next();
}

function hasValidSignature(file) {
  const signature = FILE_SIGNATURES[file.mimetype];
  return signature.every((byte, i) => file.buffer[i] === byte);
}

export async function getVerificationStatus(req, res, next) {
  try {
    res.json(await fetchVerificationStatus(req.mentor.profile));
  } catch (err) {
    next(err);
  }
}

export async function warmupVerification(req, res, next) {
  try {
    if (req.mentor.profile.isVerified) {
      return res.json({ ready: true, verified: true });
    }
    if (!isCredentialVerificationEnabled()) {
      return res.json({ ready: true });
    }
    res.json({ ready: await pingVerifier() });
  } catch (err) {
    next(err);
  }
}

export async function verify(req, res, next) {
  try {
    const consentedAt = new Date();
    const resume = req.files?.resume?.[0];

    if (!resume) {
      return res.status(400).json({ message: "A resume file is required" });
    }
    if (!hasValidSignature(resume)) {
      return res.status(400).json({
        message: "The resume must be a valid PDF, PNG or JPEG document",
      });
    }

    const { credential, isVerified, verifiedAt, eligibility } =
      await submitVerification(req.mentor.profile, resume, consentedAt);

    res.status(201).json({
      id: credential.id,
      type: credential.type,
      status: credential.status,
      createdAt: credential.createdAt,
      isVerified,
      verifiedAt,
      eligibility,
    });
  } catch (err) {
    if (err.status === 503) {
      return res.status(503).json({ message: err.message });
    }
    next(err);
  }
}

export async function updateOnboarding(req, res, next) {
  try {
    const updated = await mentorProfileService.updateOnboarding(
      req.mentor.profile,
      req.body,
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const { user, profile } = req.mentor;

    res.json({
      id: user.id,
      displayName: user.displayName,
      syntheticEmail: user.syntheticEmail,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      mentorProfile: profile,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await mentorProfileService.updateProfilePatch(
      req.mentor.profile.id,
      req.body,
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function getOverview(req, res, next) {
  try {
    const stats = await mentorshipService.getMentorOverviewStats(
      req.mentor.profile.id,
    );

    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function listMentees(req, res, next) {
  try {
    const { status } = req.query;
    if (status != null && !VALID_MENTORSHIP_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of ${VALID_MENTORSHIP_STATUSES.join(", ")}`,
      });
    }

    const mentees = await mentorshipService.listMentorMentees(
      req.mentor.profile.id,
      status,
    );

    res.json(mentees);
  } catch (err) {
    next(err);
  }
}

export async function getMenteeDetail(req, res, next) {
  try {
    const detail = await mentorshipService.getMentorMenteeDetail(
      req.mentor.profile,
      req.participant.mentorship,
    );

    res.json(detail);
  } catch (err) {
    next(err);
  }
}

export async function respondToPauseRequest(req, res, next) {
  try {
    const { action, responseNote } = req.body;
    if (!VALID_PAUSE_ACTIONS.includes(action)) {
      return res.status(400).json({
        message: `action must be one of ${VALID_PAUSE_ACTIONS.join(", ")}`,
      });
    }
    if (
      responseNote != null &&
      (typeof responseNote !== "string" ||
        responseNote.length > MAX_RESPONSE_NOTE_LENGTH)
    ) {
      return res.status(400).json({
        message: `responseNote must be a string of ${MAX_RESPONSE_NOTE_LENGTH} characters or fewer`,
      });
    }

    const result = await pauseRequestService.respondToPauseRequest(
      req.participant.mentorship,
      req.params.requestId,
      action,
      responseNote,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createToleranceEvent(req, res, next) {
  try {
    const { category, reason } = req.body;

    const result = await toleranceService.createToleranceEvent(
      req.participant.mentorship,
      req.currentUser.id,
      { category, reason },
    );

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function endMentorship(req, res, next) {
  try {
    const result = await mentorshipService.endMentorship(
      req.mentor.profile,
      req.participant.mentorship,
      req.currentUser.id,
      req.body.reason,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function respondToAdvocacyRequest(req, res, next) {
  try {
    const { action, responseNote } = req.body;
    if (!VALID_ADVOCACY_ACTIONS.includes(action)) {
      return res.status(400).json({
        message: `action must be one of ${VALID_ADVOCACY_ACTIONS.join(", ")}`,
      });
    }
    if (
      responseNote != null &&
      (typeof responseNote !== "string" ||
        responseNote.length > MAX_RESPONSE_NOTE_LENGTH)
    ) {
      return res.status(400).json({
        message: `responseNote must be a string of ${MAX_RESPONSE_NOTE_LENGTH} characters or fewer`,
      });
    }

    const result = await advocacyService.respondToAdvocacyRequest(
      req.participant.mentorship,
      req.params.requestId,
      action,
      responseNote,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listAdvocacyInbox(req, res, next) {
  try {
    const { status, includeEnded } = req.query;
    if (status != null && !VALID_ADVOCACY_INBOX_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of ${VALID_ADVOCACY_INBOX_STATUSES.join(", ")}`,
      });
    }
    if (includeEnded != null && !VALID_BOOLEAN_STRINGS.includes(includeEnded)) {
      return res.status(400).json({
        message: "includeEnded must be true or false",
      });
    }

    const requests = await advocacyService.listMentorAdvocacyRequests(
      req.mentor.profile.id,
      { status, includeEnded: includeEnded === "true" },
    );

    res.json(requests);
  } catch (err) {
    next(err);
  }
}

export async function listRequests(req, res, next) {
  try {
    const mentorProfile = req.mentor.profile;

    const { status } = req.query;
    if (status != null && !VALID_REQUEST_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of ${VALID_REQUEST_STATUSES.join(", ")}`,
      });
    }

    const requests = await mentorshipService.listMentorRequests(
      mentorProfile.id,
      status
    );

    res.json(requests);
  } catch (err) {
    next(err);
  }
}

export async function respondToRequest(req, res, next) {
  try {
    const mentorProfile = req.mentor.profile;

    const { action, responseNote } = req.body;
    if (!VALID_ACTIONS.includes(action)) {
      return res.status(400).json({
        message: `action must be one of ${VALID_ACTIONS.join(", ")}`,
      });
    }
    if (responseNote != null && typeof responseNote !== "string") {
      return res.status(400).json({ message: "responseNote must be a string" });
    }

    const result = await mentorshipService.respondToRequest(
      mentorProfile.id,
      req.params.id,
      action,
      responseNote
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}
