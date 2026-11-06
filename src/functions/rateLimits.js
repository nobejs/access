const envInt = (name, fallback) => {
  const parsed = parseInt(process.env[name], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

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

// RATE_LIMIT_WINDOW_MINUTES (default 5)
const createAccountLimiter = (max) => {
  const windowMs = envInt("RATE_LIMIT_WINDOW_MINUTES", 5) * 60 * 1000;
  const hits = new Map();
  let nextSweepAt = 0;

  return async (req, res) => {
    const now = Date.now();
    if (now >= nextSweepAt) {
      for (const [key, entry] of hits) {
        if (entry.resetAt <= now) hits.delete(key);
      }
      nextSweepAt = now + windowMs;
    }

    const key = accountKey(req);
    let entry = hits.get(key);
    if (entry === undefined || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count++;

    if (entry.count > max) {
      const error = tooManyRequests(entry.resetAt - now);
      res.header("retry-after", error.retry_after_seconds);
      throw error;
    }
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

const getRouteLimiters = (routeKey) => {
  if (!Object.hasOwn(accountLimitedRoutes, routeKey)) return [];
  const max = envInt(
    "RATE_LIMIT_PER_ATTRIBUTE",
    accountLimitedRoutes[routeKey]
  );
  return [createAccountLimiter(max)];
};

module.exports = { globalRateLimit, getRouteLimiters };
