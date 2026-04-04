import { NextRequest, NextResponse } from "next/server";
import { getRuleForPath } from "@/lib/rateLimit";

// In-memory store for rate limit tracking
// Key format: "{ip}:{pathname_prefix}"
// Value: { count: number; resetAt: number }
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let requestCount = 0;

/**
 * Clean up expired entries from the rate limit store
 * Runs every 100 requests to prevent unbounded growth
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Extract client IP from request
 * Tries multiple header sources for compatibility with proxies
 */
function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  return "unknown";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Exclude cron endpoints (protected by CRON_SECRET header)
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  // Exclude NextAuth signout (no rate limit needed)
  if (pathname === "/api/auth/signout") {
    return NextResponse.next();
  }

  // Exclude NextAuth internal routes (not user-facing)
  if (
    pathname.startsWith("/api/auth/callback") ||
    pathname.startsWith("/api/auth/session") ||
    pathname.startsWith("/api/auth/csrf") ||
    pathname.startsWith("/api/auth/providers") ||
    pathname.startsWith("/api/auth/_log")
  ) {
    return NextResponse.next();
  }

  // Check if this pathname has a rate limit rule
  const match = getRuleForPath(pathname);
  if (!match) {
    return NextResponse.next();
  }

  const { rule, prefix } = match;

  // Get client IP
  const clientIp = getClientIp(request);

  // Build rate limit key using matched prefix (not full pathname)
  // This way all sub-paths share the same counter
  const key = `${clientIp}:${prefix}`;

  // Get or create entry
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new entry
    entry = {
      count: 1,
      resetAt: now + rule.windowMs,
    };
    rateLimitStore.set(key, entry);

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(rule.limit));
    response.headers.set("X-RateLimit-Remaining", String(rule.limit - 1));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    return response;
  }

  // Check if limit exceeded
  if (entry.count >= rule.limit) {
    const secondsUntilReset = Math.ceil((entry.resetAt - now) / 1000);

    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(secondsUntilReset),
          "X-RateLimit-Limit": String(rule.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  // Increment count and allow through
  entry.count += 1;

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(rule.limit));
  response.headers.set("X-RateLimit-Remaining", String(rule.limit - entry.count));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

  // Run cleanup every 100 requests
  requestCount += 1;
  if (requestCount % 100 === 0) {
    cleanupExpiredEntries();
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
