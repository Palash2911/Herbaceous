const TIMEOUT_MS = 90000;
const HEALTH_TIMEOUT_MS = 10000;
const MAX_FIELD_LENGTH = 300;
const MAX_LIST_LENGTH = 50;
const UNREADABLE_MESSAGE = "Could not read any employment dates from this document";

export function isCredentialVerificationEnabled() {
  return (
    process.env.CREDENTIAL_VERIFICATION_ENABLED === "true" &&
    Boolean(process.env.MATCHING_SERVICE_URL)
  );
}

export async function pingVerifier() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const res = await fetch(`${process.env.MATCHING_SERVICE_URL}/health`, {
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

function isString(value) {
  return typeof value === "string";
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function clip(value) {
  return value == null ? null : value.slice(0, MAX_FIELD_LENGTH);
}

function toVerificationResult(data) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const isValid =
    typeof data.eligible === "boolean" &&
    isFiniteNumber(data.total_experience_years) &&
    isFiniteNumber(data.threshold_years) &&
    isCount(data.periods_counted) &&
    isCount(data.skipped_entries) &&
    Array.isArray(data.reasons) &&
    data.reasons.every(isString);

  if (!isValid) {
    return null;
  }

  return {
    eligible: data.eligible,
    totalExperienceYears: data.total_experience_years,
    thresholdYears: data.threshold_years,
    periodsCounted: data.periods_counted,
    skippedEntries: data.skipped_entries,
    reasons: data.reasons.slice(0, MAX_LIST_LENGTH).map(clip),
  };
}

export async function verifyResumeRemote(file) {
  if (!isCredentialVerificationEnabled()) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const form = new FormData();
    form.append("file", new Blob([file.buffer], { type: file.mimetype }), "document");

    const res = await fetch(
      `${process.env.MATCHING_SERVICE_URL}/verify-from-document`,
      {
        method: "POST",
        headers: {
          "X-Internal-Api-Key": process.env.MATCHING_SERVICE_API_KEY ?? "",
        },
        body: form,
        signal: controller.signal,
      },
    );

    if (res.status === 422) {
      const body = await res.json().catch(() => null);
      throw makeError(
        422,
        typeof body?.error === "string" ? clip(body.error) : UNREADABLE_MESSAGE,
      );
    }

    if (!res.ok) {
      console.warn(`[credentialExtraction] remote verification HTTP ${res.status}`);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.warn(
        `[credentialExtraction] remote verification returned a non-JSON body (HTTP ${res.status})`,
      );
      return null;
    }

    const result = toVerificationResult(await res.json());
    if (!result) {
      console.warn("[credentialExtraction] remote verification: unexpected response shape");
      return null;
    }

    return result;
  } catch (err) {
    if (err.status === 422) {
      throw err;
    }
    console.warn(`[credentialExtraction] remote verification failed: ${err.name}`);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
