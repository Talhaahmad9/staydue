// Rate limiting configuration for API endpoints
// Uses simple in-memory Map with IP-based bucketing
// Suitable for this scale; Upstash Redis can be added later if needed

export const rateLimitRules: Record<string, { limit: number; windowMs: number }> = {
  // More specific paths first to prevent shadowing by shorter prefixes
  "/api/auth/verify-email": { limit: 10, windowMs: 60 * 60 * 1000 }, // 10/hr
  "/api/auth/resend-otp": { limit: 5, windowMs: 60 * 60 * 1000 }, // 5/hr
  "/api/auth/forgot-password": { limit: 5, windowMs: 60 * 60 * 1000 }, // 5/hr
  "/api/auth/reset-password": { limit: 5, windowMs: 60 * 60 * 1000 }, // 5/hr
  "/api/auth/signin": { limit: 10, windowMs: 60 * 60 * 1000 }, // 10/hr — NextAuth signin
  "/api/auth": { limit: 5, windowMs: 60 * 60 * 1000 }, // 5/hr  — custom signup
  "/api/calendar/refresh": { limit: 20, windowMs: 60 * 60 * 1000 }, // 20/hr
  "/api/calendar": { limit: 10, windowMs: 60 * 60 * 1000 }, // 10/hr
  "/api/settings": { limit: 30, windowMs: 60 * 60 * 1000 }, // 30/hr
  "/api/deadlines": { limit: 60, windowMs: 60 * 60 * 1000 }, // 60/hr
  "/api/subscription": { limit: 10, windowMs: 60 * 60 * 1000 }, // 10/hr
  "/api/webhook": { limit: 200, windowMs: 60 * 60 * 1000 }, // 200/hr
};

/**
 * Find a rate limit rule that matches the given pathname
 * Uses prefix matching: "/api/deadlines" matches "/api/deadlines/[id]/done"
 * Returns both the rule and the matched prefix to use as the rate limit key
 * Returns null if no rule matches
 */
export function getRuleForPath(
  pathname: string
): { rule: { limit: number; windowMs: number }; prefix: string } | null {
  // Iterate through rules in definition order (more specific paths come first)
  for (const [prefix, rule] of Object.entries(rateLimitRules)) {
    if (pathname.startsWith(prefix)) {
      return { rule, prefix };
    }
  }

  return null;
}
