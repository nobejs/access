const envInt = (name, fallback) => {
  const parsed = parseInt(process.env[name], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const rateLimitEnabled = () => process.env.RATE_LIMIT_ENABLED === "true";

const tooManyRequests = (retryAfterMs) => ({
  statusCode: 429,
  message: "TooManyRequests",
  retry_after_seconds: Math.ceil(retryAfterMs / 1000),
});

// Global per-IP limit for @fastify/rate-limit: RATE_LIMIT_PER_IP per minute
const globalAllowList = ["/health", "/readiness", "/authorize"];

const globalRateLimit = () => ({
  max: envInt("RATE_LIMIT_PER_IP", 200),
  timeWindow: 60 * 1000,
  cache: 50000,
  allowList: (req) => globalAllowList.includes(req.routeOptions.url),
  errorResponseBuilder: (_req, context) => tooManyRequests(context.ttl),
});

// Per-account limit for sensitive routes
const readField = (req, name) => {
  for (const source of [req.query, req.params, req.body]) {
    const field = source?.[name];
    if (typeof field === "number") return String(field);
    if (typeof field === "string" && field !== "") return field;
  }
  return undefined;
};

const accountFields = ["value", "email", "user_uuid"];

const accountKey = (req) => {
  for (const name of accountFields) {
    const field = readField(req, name);
    if (field !== undefined) {
      const type = readField(req, "type") || name;
      return `account:${type}:${field.trim().toLowerCase()}`;
    }
  }
  if (req.sub) return `sub:${req.sub}`;
  return `ip:${req.ip}`;
};

const createAccountLimiter = (app, max) => {
  const checkLimit = app.createRateLimit({
    max,
    timeWindow: envInt("RATE_LIMIT_WINDOW_MINUTES", 5) * 60 * 1000,
    cache: 50000,
    keyGenerator: accountKey,
  });

  return async (req, res) => {
    const limit = await checkLimit(req);
    if (limit.isAllowed || !limit.isExceeded) return;
    const error = tooManyRequests(limit.ttl);
    res.header("retry-after", error.retry_after_seconds);
    throw error;
  };
};

// Default max per account; RATE_LIMIT_PER_ATTRIBUTE overrides all
const accountLimitedRoutes = {
  "POST /login": 20,
  "POST /login/otp": 20,
  "POST /login/otp/initiate": 10,
  "POST /verify-registration": 20,
  "POST /reset-password": 20,
  "POST /reset-password-with-link": 20,
};

const getRouteLimiters = (app, routeKey) => {
  if (!rateLimitEnabled()) return [];
  if (!Object.hasOwn(accountLimitedRoutes, routeKey)) return [];
  const max = envInt(
    "RATE_LIMIT_PER_ATTRIBUTE",
    accountLimitedRoutes[routeKey]
  );
  return [createAccountLimiter(app, max)];
};

module.exports = { rateLimitEnabled, globalRateLimit, getRouteLimiters };
