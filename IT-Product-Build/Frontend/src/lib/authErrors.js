export const CREDENTIALS_ERROR = "Email or password is incorrect.";
export const SERVER_UNREACHABLE_ERROR =
  "Can't reach the server right now. Try again in a moment.";

const CREDENTIAL_CODES = new Set([
  "NotAuthorizedException",
  "UserNotFoundException",
]);

const SERVER_CODES = new Set([
  "NetworkError",
  "InternalErrorException",
  "ServiceUnavailableException",
  "TimeoutError",
  "AbortError",
]);

export function isCredentialsError(error) {
  return CREDENTIAL_CODES.has(error?.code) || CREDENTIAL_CODES.has(error?.name);
}

export function isServerUnreachableError(error) {
  if (!error) return false;
  if (SERVER_CODES.has(error.code) || SERVER_CODES.has(error.name)) return true;
  if (error.name === "TypeError") return true;
  if (typeof error.status === "number") {
    return error.status === 0 || error.status >= 500;
  }
  if (typeof error.statusCode === "number") {
    return error.statusCode === 0 || error.statusCode >= 500;
  }
  return false;
}
