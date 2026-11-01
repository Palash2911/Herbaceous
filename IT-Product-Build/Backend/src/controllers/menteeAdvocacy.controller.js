import * as advocacyService from "../services/advocacyService.js";

export async function listAdvocacyRequests(req, res, next) {
  try {
    const result = await advocacyService.listAdvocacyRequests(req.mentee.mentorship);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createAdvocacyRequest(req, res, next) {
  try {
    const { type, details } = req.body;
    const request = await advocacyService.createAdvocacyRequest(req.mentee.mentorship, {
      type,
      details,
    });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

export async function withdrawAdvocacyRequest(req, res, next) {
  try {
    const request = await advocacyService.withdrawAdvocacyRequest(
      req.mentee.mentorship,
      req.params.id,
    );
    res.json(request);
  } catch (err) {
    next(err);
  }
}
