import prisma from "../config/prisma.js";
import * as authService from "../services/authService.js";
import { isValidDisplayName } from "../utils/validate.js";

const VALID_ROLES = ["MENTEE", "MENTOR"];

export async function signup(req, res, next) {
  const { role } = req.body;

  if (!VALID_ROLES.includes(role)) {
    return res
      .status(400)
      .json({ message: `role must be one of ${VALID_ROLES.join(", ")}` });
  }

  let identity;
  try {
    identity = await authService.signup(role);
  } catch (err) {
    console.error("[auth.signup] Cognito provisioning failed:", err.message);
    return next(
      Object.assign(new Error("Could not create account. Please try again."), {
        status: 500,
      }),
    );
  }

  const { syntheticEmail, displayName, password, cognitoUid } = identity;

  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { cognitoUid, syntheticEmail, displayName, role },
      });

      if (role === "MENTEE") {
        await tx.menteeProfile.create({ data: { userId: created.id } });
      } else {
        await tx.mentorProfile.create({ data: { userId: created.id } });
      }
    });
  } catch (err) {
    console.error(
      "[auth.signup] DB write failed, rolling back Cognito user:",
      err.message,
    );
    await authService.deleteCognitoUser(syntheticEmail);
    return next(
      Object.assign(new Error("Could not create account. Please try again."), {
        status: 500,
      }),
    );
  }

  res.set("Cache-Control", "no-store");
  res.status(201).json({ syntheticEmail, password, displayName, role });
}

export async function summary(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { cognitoUid: req.user.sub },
      select: {
        role: true,
        displayName: true,
        syntheticEmail: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User record not found, registration may be incomplete",
      });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { cognitoUid: req.user.sub },
      include: { menteeProfile: true, mentorProfile: true },
    });

    if (!user) {
      return res.status(404).json({
        message: "User record not found, registration may be incomplete",
      });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  const { displayName } = req.body;

  if (!isValidDisplayName(displayName)) {
    return res.status(400).json({
      message:
        "displayName must be 2 to 40 characters and may only contain letters, numbers, spaces, hyphens and apostrophes",
    });
  }

  try {
    const user = await prisma.user.update({
      where: { cognitoUid: req.user.sub },
      data: { displayName: displayName.trim() },
      include: { menteeProfile: true, mentorProfile: true },
    });

    res.json(user);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "User record not found, registration may be incomplete",
      });
    }
    next(err);
  }
}
