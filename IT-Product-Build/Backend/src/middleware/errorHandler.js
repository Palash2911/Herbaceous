const GENERIC_SERVER_ERROR = "Something went wrong. Please try again.";
const INVALID_JSON = "Request body is not valid JSON.";
const BODY_TOO_LARGE = "Request body is too large.";

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) return next(err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: INVALID_JSON });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: BODY_TOO_LARGE });
  }

  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 600
      ? err.status
      : 500;

  const message =
    status < 500 && err.message ? err.message : GENERIC_SERVER_ERROR;

  res.status(status).json({ message });
}
