import { isCredentialVerificationEnabled } from "../services/credentialExtraction.js";

export function requireCredentialVerification(req, res, next) {
  if (!isCredentialVerificationEnabled()) {
    return res
      .status(503)
      .json({ message: "Credential verification is not available" });
  }
  next();
}
