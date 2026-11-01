import prisma from "../config/prisma.js";
import {
  isCredentialVerificationEnabled,
  verifyResumeRemote,
} from "./credentialExtraction.js";

const REVIEW_NOTE = "Automated experience check";

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function getVerificationStatus(mentorProfile) {
  const latest = await prisma.credential.findFirst({
    where: { mentorProfileId: mentorProfile.id, type: "MENTOR_VERIFICATION" },
    orderBy: { createdAt: "desc" },
    select: { status: true, createdAt: true, extractedFields: true },
  });
  const fields = latest?.extractedFields ?? {};

  return {
    enabled: isCredentialVerificationEnabled(),
    isVerified: mentorProfile.isVerified,
    verifiedAt: mentorProfile.verifiedAt,
    latest: latest
      ? {
          status: latest.status,
          createdAt: latest.createdAt,
          totalExperienceYears: fields.totalExperienceYears ?? null,
          thresholdYears: fields.thresholdYears ?? null,
          reasons: Array.isArray(fields.reasons) ? fields.reasons : [],
        }
      : null,
  };
}

export async function submitVerification(mentorProfile, resumeFile, consentedAt) {
  const result = await verifyResumeRemote(resumeFile);
  if (!result) {
    throw makeError(503, "Verification is unavailable, try again later");
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const credential = await tx.credential.create({
      data: {
        mentorProfileId: mentorProfile.id,
        type: "MENTOR_VERIFICATION",
        status: result.eligible ? "APPROVED" : "REJECTED",
        reviewedAt: now,
        reviewNote: REVIEW_NOTE,
        extractedFields: result,
        consentedAt,
      },
    });

    if (result.eligible) {
      await tx.mentorProfile.updateMany({
        where: { id: mentorProfile.id, isVerified: false },
        data: { isVerified: true, verifiedAt: now },
      });
    }

    const profile = await tx.mentorProfile.findUnique({
      where: { id: mentorProfile.id },
      select: { isVerified: true, verifiedAt: true },
    });

    return {
      credential,
      isVerified: profile.isVerified,
      verifiedAt: profile.verifiedAt,
      eligibility: {
        eligible: result.eligible,
        totalExperienceYears: result.totalExperienceYears,
        thresholdYears: result.thresholdYears,
        reasons: result.reasons,
      },
    };
  });
}
