import prisma from "../config/prisma.js";
import { isHttpsUrl } from "../utils/validate.js";

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function displayNameFor(userId) {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true },
  });
  return user?.displayName ?? null;
}

export async function getChatRoom(mentorship) {
  const updatedBy = await displayNameFor(mentorship.chatRoomUpdatedById);
  return {
    chatRoomUrl: mentorship.chatRoomUrl,
    updatedBy,
    updatedAt: mentorship.chatRoomUpdatedAt,
  };
}

export async function updateChatRoom(mentorship, user, url) {
  if (url !== null && !isHttpsUrl(url, 500)) {
    throw makeError(400, "url must be a valid https URL, or null to clear it");
  }

  const updated = await prisma.mentorship.update({
    where: { id: mentorship.id },
    data: {
      chatRoomUrl: url,
      chatRoomUpdatedById: user.id,
      chatRoomUpdatedAt: new Date(),
    },
  });

  return {
    chatRoomUrl: updated.chatRoomUrl,
    updatedBy: user.displayName,
    updatedAt: updated.chatRoomUpdatedAt,
  };
}
