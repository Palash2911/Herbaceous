import { isOneOf, isPositiveInt } from "../utils/validate.js";
import { VALID_FIELDS } from "../utils/profileEnums.js";
import {
  getMentorForMentee,
  listMentorsForMentee,
} from "../services/matching/mentorDiscovery.js";

const VALID_SORTS = ["score", "experience"];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parseVerified(raw) {
  if (raw == null) return undefined;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return "invalid";
}

export async function listMentors(req, res, next) {
  try {
    const { field, verified: verifiedRaw, sort = "score", limit: limitRaw, offset: offsetRaw } =
      req.query;

    if (field != null && !isOneOf(field, VALID_FIELDS)) {
      return res.status(400).json({ message: "Invalid field" });
    }

    const verified = parseVerified(verifiedRaw);
    if (verified === "invalid") {
      return res.status(400).json({ message: "verified must be true or false" });
    }

    if (!isOneOf(sort, VALID_SORTS)) {
      return res.status(400).json({ message: `sort must be one of ${VALID_SORTS.join(", ")}` });
    }

    const limit = limitRaw == null ? DEFAULT_LIMIT : Number(limitRaw);
    if (!isPositiveInt(limit, MAX_LIMIT)) {
      return res.status(400).json({ message: `limit must be a positive integer up to ${MAX_LIMIT}` });
    }

    const offset = offsetRaw == null ? 0 : Number(offsetRaw);
    if (!Number.isInteger(offset) || offset < 0) {
      return res.status(400).json({ message: "offset must be a non-negative integer" });
    }

    const result = await listMentorsForMentee(req.mentee.profile, {
      field,
      verified,
      sort,
      limit,
      offset,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMentorDetail(req, res, next) {
  try {
    const mentor = await getMentorForMentee(req.mentee.profile, req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.json(mentor);
  } catch (err) {
    next(err);
  }
}
