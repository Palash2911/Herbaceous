import rateLimit from "express-rate-limit";

export const verificationWarmupRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.mentor.profile.id,
  message: { message: "Too many requests. Please wait a moment." },
});
