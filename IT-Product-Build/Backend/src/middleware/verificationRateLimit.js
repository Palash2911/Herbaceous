import rateLimit from "express-rate-limit";

export const verificationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.mentor.profile.id,
  message: { message: "Too many verification attempts. Please try again later." },
});
