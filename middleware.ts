import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const limiters: Record<string, Ratelimit> = {
  "/api/auth/verify-email":    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10,  "1 h") }),
  "/api/auth/verify-phone":    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10,  "1 h") }),
  "/api/auth/send-phone-otp":  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,   "1 h") }),
  "/api/auth/resend-otp":      new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,   "1 h") }),
  "/api/auth/forgot-password": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,   "1 h") }),
  "/api/auth/reset-password":  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,   "1 h") }),
  "/api/auth/signin":          new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10,  "1 h") }),
  "/api/auth":                 new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(15,  "1 h") }),
  "/api/calendar/refresh":     new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20,  "1 h") }),
  "/api/calendar":             new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10,  "1 h") }),
  "/api/settings":             new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30,  "1 h") }),
  "/api/deadlines":            new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60,  "1 h") }),
  "/api/subscription/status":  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60,  "1 h") }),
  "/api/subscription":         new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10,  "1 h") }),
  "/api/webhook":              new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(200, "1 h") }),
};

const PREFIXES = Object.keys(limiters);

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Routes where IP-based limiting is correct (unauthenticated, brute-force targets)
const IP_KEYED_PREFIXES = new Set([
  "/api/auth/verify-email",
  "/api/auth/verify-phone",
  "/api/auth/send-phone-otp",
  "/api/auth/resend-otp",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/signin",
  "/api/auth",
  "/api/webhook",
]);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Admin route protection — checked before rate limiting
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (!token?.email || !adminEmails.includes(token.email)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/cron") ||
    pathname === "/api/auth/signout" ||
    pathname.startsWith("/api/auth/callback") ||
    pathname.startsWith("/api/auth/session") ||
    pathname.startsWith("/api/auth/csrf") ||
    pathname.startsWith("/api/auth/providers") ||
    pathname.startsWith("/api/auth/_log")
  ) {
    return NextResponse.next();
  }

  const matchedPrefix = PREFIXES.find((p) => pathname.startsWith(p));
  if (!matchedPrefix) return NextResponse.next();

  // Use session user ID for authenticated routes to avoid CGNAT false positives.
  // Fall back to IP for unauthenticated routes (signin, signup, etc.)
  let identifier: string;
  if (IP_KEYED_PREFIXES.has(matchedPrefix)) {
    identifier = getClientIp(request);
  } else {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    identifier = token?.sub ?? getClientIp(request);
  }

  const limiter = limiters[matchedPrefix];
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
  };

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) },
      },
    );
  }

  const response = NextResponse.next();
  Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
