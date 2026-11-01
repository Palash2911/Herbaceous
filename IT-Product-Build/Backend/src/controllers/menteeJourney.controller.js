import * as weeklyLogService from "../services/weeklyLogService.js";
import * as pauseRequestService from "../services/pauseRequestService.js";

export async function listWeeklyLogs(req, res, next) {
  try {
    const { mentorship } = req.mentee;

    if (!mentorship) {
      return res.json({ weekNumber: null, weeksLogged: 0, weeks: [] });
    }

    const result = await weeklyLogService.getWeeklyLogs(mentorship);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createWeeklyLog(req, res, next) {
  try {
    const { status, note, weekNumber } = req.body;

    const result = await weeklyLogService.createWeeklyLog(req.mentee.mentorship, {
      status,
      note,
      weekNumber,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateWeeklyLog(req, res, next) {
  try {
    const { status, note } = req.body;

    const log = await weeklyLogService.updateWeeklyLog(
      req.mentee.mentorship,
      req.params.id,
      { status, note },
    );

    res.json(log);
  } catch (err) {
    next(err);
  }
}

export async function createPauseRequest(req, res, next) {
  try {
    const { type, reason, expectedWeeks } = req.body;

    const request = await pauseRequestService.createPauseRequest(
      req.mentee.mentorship,
      req.mentee.user.id,
      { type, reason, expectedWeeks },
    );

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

export async function listPauseRequests(req, res, next) {
  try {
    const requests = await pauseRequestService.listPauseRequests(req.mentee.mentorship);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

export async function withdrawPauseRequest(req, res, next) {
  try {
    const request = await pauseRequestService.withdrawPauseRequest(
      req.mentee.mentorship,
      req.params.id,
    );
    res.json(request);
  } catch (err) {
    next(err);
  }
}
