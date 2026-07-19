import { rateLimit, SECOND } from "express-rate-limit";

export const httpLimiter = rateLimit({
  windowMs: 10 * SECOND, // SECOND, MINUTE, HOUR, and DAY constants are available, or a use bare number for milliseconds
  limit: 50, // Limit each IP to 50 requests per `window` (here, per 10 seconds).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

export const wsHandshakeLimiter = rateLimit({
  windowMs: 10 * SECOND,
  limit: 5,
  legacyHeaders: false,
});
