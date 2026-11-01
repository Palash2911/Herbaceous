import rateLimit from "express-rate-limit";

export const helpTicketRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: (req) => req.currentUser.id,
  message: {
    message:
      "You have sent several reports in the last hour. Please try again later. If you are in immediate danger, call 000.",
  },
});
