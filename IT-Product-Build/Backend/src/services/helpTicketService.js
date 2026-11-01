import prisma from "../config/prisma.js";
import { isLengthBetween, isOneOf } from "../utils/validate.js";

const VALID_CATEGORIES = ["CONDUCT", "SAFETY", "TECHNICAL", "OTHER"];
const MAX_MESSAGE_LENGTH = 1000;

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function createHelpTicket(user, { category, message }) {
  if (!isOneOf(category, VALID_CATEGORIES)) {
    throw makeError(400, `category must be one of ${VALID_CATEGORIES.join(", ")}`);
  }

  const trimmedMessage = typeof message === "string" ? message.trim() : "";
  if (!isLengthBetween(trimmedMessage, 1, MAX_MESSAGE_LENGTH)) {
    throw makeError(
      400,
      `message is required and must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
    );
  }

  return prisma.helpTicket.create({
    data: {
      userId: user.id,
      category,
      message: trimmedMessage,
    },
    select: {
      id: true,
      category: true,
      status: true,
      createdAt: true,
    },
  });
}
