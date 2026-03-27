export const LOGGER_CONTEXT = "PMTL_API";

export const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.body.password",
  "req.body.passwordConfirm",
  "req.body.currentPassword",
  "req.body.newPassword",
  "req.body.token",
  "req.body.refreshToken",
  "res.headers['set-cookie']",
];

export const REQUEST_ID_HEADER = "x-request-id";
