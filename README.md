<div align="center">
  <img src="public/staydue_logo.svg" alt="StayDue" height="60" />
  <br /><br />
  <p><strong>Never miss a university deadline again.</strong></p>
  <p>Deadline reminders for IOBM students — via WhatsApp and email, automatically.</p>
  <br />

  ![Live](https://img.shields.io/badge/Live-staydue.app-0D9488?style=for-the-badge&logo=vercel&logoColor=white)
  ![Next.js](https://img.shields.io/badge/Next.js_16-App_Router-0D9488?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-Strict-0D9488?style=for-the-badge&logo=typescript&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-0D9488?style=for-the-badge&logo=mongodb&logoColor=white)
</div>

---

## What is StayDue?

StayDue is a deadline reminder app built for IOBM students using Moodle at [lms.iobm.edu.pk](https://lms.iobm.edu.pk). Students paste their Moodle calendar export URL — StayDue parses every assignment deadline, resolves full course names from the IOBM course catalog, and sends timed reminders via WhatsApp and email before each due date.

Overdue follow-up notices are sent automatically after a deadline passes, so even late submissions can still be caught in time. Calendars are re-synced daily to pick up new assignments without any action from the student.

---

## The Problem

Students on Moodle have no reliable push notification system for deadlines. The only way to know about upcoming submissions is to manually log in and check — which most students forget to do until it is too late. Deadlines get missed not because of laziness, but because there was no reminder.

---

## How It Works

### For the student

| Step | What happens |
|---|---|
| 1. Sign up | Google OAuth or email + OTP verification |
| 2. Paste Moodle URL | The ICS calendar export URL from lms.iobm.edu.pk |
| 3. Select admission year | Course codes are resolved to full names using the IOBM catalog |
| 4. Add WhatsApp number | Optional — activates a 7-day free trial of WhatsApp reminders |
| 5. Done | Deadlines are imported. Reminders run automatically from this point forward. |

### What runs automatically

- Daily calendar re-sync picks up new assignments as they are posted
- Reminders sent **3 days before**, **1 day before**, and **on the day of** each deadline
- If a deadline passes unsubmitted, overdue notices are sent over the following days (up to 3 notices)
- Assignments marked as done stop generating reminders

---

## Features

| Feature | Detail |
|---|---|
| Moodle calendar sync | Paste the ICS export URL once — daily cron picks up new deadlines |
| Course name resolution | Course codes matched against a per-year IOBM catalog (2020–2026) |
| WhatsApp reminders | Meta WhatsApp Business Cloud API — Pro subscription or 7-day trial |
| Email reminders | Resend — included in all plans |
| Overdue follow-ups | 3-stage automated overdue notice sequence |
| Dashboard | Urgency-coded deadline list — today (red), tomorrow (amber), upcoming (neutral) |
| Course filter | Filter the deadline list by individual course |
| Subscriptions | Manual payment flow: JazzCash, Easypaisa, bank transfer — admin review |
| Discount codes | Admin-managed codes with per-plan applicability and usage limits |
| Admin panel | Subscriptions, users, revenue, testimonials, notifications, system health |

---

## Tech Stack

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript_Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js_v4-black?style=flat-square&logo=nextdotjs)
![Resend](https://img.shields.io/badge/Resend-black?style=flat-square)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel)

</div>

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router, TypeScript strict |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas (Mongoose) |
| Auth | NextAuth.js v4 — Google OAuth + email credentials |
| Email | Resend + React Email |
| WhatsApp | Meta WhatsApp Business Cloud API (Graph API v25.0) |
| File storage | Cloudflare R2, S3-compatible via AWS SDK |
| ICS parsing | Custom VEVENT parser (node-ical dropped due to BigInt runtime failure in Next.js) |
| Cron jobs | Vercel Cron + cron-job.org |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Project Structure

```
staydue/
├── app/
│   ├── (auth)/              # Login, signup, verify email, password reset
│   ├── api/
│   │   ├── auth/            # NextAuth + custom auth endpoints
│   │   ├── calendar/        # Calendar sync and refresh
│   │   ├── cron/            # notify, refresh-calendars, expire-subscriptions
│   │   ├── settings/        # Account and notification settings
│   │   ├── subscription/    # Payment submit, discount validation, status
│   │   └── webhook/         # WhatsApp webhook (HMAC-validated)
│   ├── admin/               # Admin panel (server-protected)
│   ├── dashboard/           # Student deadline dashboard
│   ├── onboarding/          # New user setup flow
│   └── settings/            # Account and notification settings
├── components/
│   ├── admin/               # Admin panel UI
│   ├── auth/                # Auth form components
│   ├── dashboard/           # Deadline cards, filters, sidebar
│   ├── landing/             # Landing page sections
│   ├── onboarding/          # Calendar URL form, phone verification
│   ├── settings/            # Settings sections
│   └── shared/              # Navbar, footer, modals, loaders
├── emails/                  # React Email templates
├── lib/                     # Core logic — auth, calendar, notifications, r2, whatsapp
├── types/                   # TypeScript interfaces
├── utils/                   # Date helpers, sanitization, validation, OTP
└── catalog-data/            # IOBM course catalog JSON (2020–2026)
```

---

## Notification Pipeline

Cron runs 3× daily via Vercel Cron:

```
06:05 AM PKT  →  /api/cron/notify
12:05 PM PKT  →  /api/cron/notify
00:05 AM PKT  →  /api/cron/notify
```

Each run:

1. Queries all deadlines needing reminders using a 2-query batch pattern (no N+1)
2. Sends email via Resend — WhatsApp is independent and does not block email delivery
3. On email failure, rolls back the reminder timestamp atomically via `$pop`
4. Processes overdue deadlines — up to 3 notices per deadline, spaced by day
5. Deduplicates WhatsApp sends with a DB-level `lastWhatsappSentAt` guard

Calendar re-sync (`/api/cron/refresh-calendars`) runs separately — processes users in batches of 10, deletes stale deadlines no longer present in the ICS feed.

---

## Subscription Model

Manual payment flow targeting Pakistani students with no international card access.

| Plan | Price |
|---|---|
| Monthly | PKR 300 / month |
| Semester | PKR 1,000 / semester |

Students submit a payment screenshot and transaction ID in-app. Admin reviews and activates manually. WhatsApp reminders are gated behind an active Pro subscription or the 7-day phone verification trial (one trial per real phone number, enforced at the DB level).

---

## Running Locally

```bash
# Install dependencies
npm install

# Add environment variables
cp .env.example .env.local
# Fill in all required values (see below)

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

```bash
# Database
MONGODB_URI=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# WhatsApp (Meta Business API)
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
WHATSAPP_TEMPLATE_REMINDER=
WHATSAPP_TEMPLATE_OVERDUE=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=

# Cloudflare R2
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Cron + Admin
CRON_SECRET=
ADMIN_EMAILS=
```

---

## Security

- Every protected API route validates session before executing any logic — client-sent user IDs are never trusted
- WhatsApp webhook validates `X-Hub-Signature-256` HMAC on every inbound request
- Password reset uses SHA256-hashed tokens with O(1) indexed lookup
- Zod schema validation on every API route input
- Rate limiting on all public-facing endpoints
- MongoDB queries go through Mongoose schema validation — no raw user input passed as query operators
- No PII in server logs — phone numbers are masked, emails are not logged after send
- Security headers via `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`

---

## Built By

Talha Ahmad — IOBM, Karachi, Pakistan.

Built to solve a real problem for real students. StayDue is a live product, not a portfolio project.

**[staydue.app](https://staydue.app)**


Live at **[staydue.app](https://staydue.app)** — built for IOBM students in Karachi, Pakistan.

---

## The Problem

University students on Moodle-based systems (like IOBM's lms.iobm.edu.pk) have no reliable way to get notified about upcoming deadlines outside of manually checking the platform. Deadlines get missed. Assignments get submitted late or not at all — not because of laziness, but because there was no reminder.

## The Solution

StayDue connects to any Moodle account via its public calendar export URL (no Moodle credentials required), reads every assignment deadline, and sends timed reminders to WhatsApp and email automatically. You set it up once in two minutes and it runs in the background every day.

---

## How It Works

### For the student

1. **Sign up** with Google or email
2. **Paste your Moodle calendar export URL** — found at the bottom of your Moodle Calendar page
3. **Select your admission year** — StayDue resolves your course codes into full course names automatically
4. **Add your WhatsApp number** (optional) — triggers a 7-day free trial of WhatsApp reminders
5. **Done** — deadlines are imported, reminders are scheduled, nothing else to do

### What happens automatically

- StayDue re-fetches your Moodle calendar every day to pick up new assignments
- Reminders are sent 3 days before, 1 day before, and on the day of each deadline
- If a deadline passes, follow-up overdue notices are sent over the next several days
- Assignments you mark as done stop generating reminders

---

## Features

| Feature | Detail |
|---|---|
| Moodle calendar sync | Paste your ICS export URL once — daily auto-refresh picks up new deadlines |
| Course name resolution | Course codes (e.g. `MGT301`) are matched against a per-year IOBM catalog to show full names |
| WhatsApp reminders | Via Meta WhatsApp Business Cloud API — requires active Pro subscription or 7-day trial |
| Email reminders | Via Resend — included in all plans |
| Overdue follow-ups | 3-stage automated overdue notice sequence after a deadline passes |
| Dashboard | Urgency-color-coded deadline list — red (today), amber (tomorrow), neutral (upcoming) |
| Course filter | Filter deadlines by individual course |
| Subscription system | Manual payment flow (JazzCash, Easypaisa, bank transfer) with admin review |
| Discount codes | Admin-managed codes with per-plan applicability and usage limits |
| Admin panel | Full management panel — subscriptions, users, revenue, testimonials, notifications |
| Security | HMAC-validated WhatsApp webhook, hashed password reset tokens, rate-limited API routes, NoSQL injection protection, XSS sanitization |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | NextAuth.js v4 (Google OAuth + email credentials) |
| Email | Resend + React Email |
| WhatsApp | Meta WhatsApp Business Cloud API (Graph API v25.0) |
| File storage | Cloudflare R2 (S3-compatible, via AWS SDK) |
| ICS parsing | Custom VEVENT parser (node-ical dropped due to BigInt runtime failure) |
| Cron jobs | Vercel Cron + cron-job.org |
| Deployment | Vercel |
| Animations | Framer Motion |

---

## Project Structure

```
staydue/
├── app/
│   ├── (auth)/              # Login, signup, verify email, password reset
│   ├── api/                 # All API routes
│   │   ├── auth/            # NextAuth + custom auth endpoints
│   │   ├── calendar/        # Calendar sync and refresh
│   │   ├── cron/            # Scheduled jobs (notify, refresh, expire subscriptions)
│   │   ├── settings/        # Account and notification settings
│   │   ├── subscription/    # Payment submission, discount validation, status
│   │   └── webhook/         # WhatsApp webhook (HMAC-validated)
│   ├── admin/               # Admin panel (protected)
│   ├── dashboard/           # Student dashboard
│   ├── onboarding/          # New user setup flow
│   └── settings/            # Account and notification settings
├── components/
│   ├── admin/               # Admin panel components
│   ├── auth/                # Auth form components
│   ├── dashboard/           # Deadline cards, filters, sidebar
│   ├── landing/             # Landing page sections
│   ├── onboarding/          # Calendar URL form, phone verification
│   ├── settings/            # Settings section components
│   └── shared/              # Navbar, footer, modals, loaders
├── emails/                  # React Email templates (OTP, reminders, overdue, billing)
├── lib/                     # Core logic — auth, calendar, notifications, r2, whatsapp
├── types/                   # TypeScript interfaces
├── utils/                   # Date helpers, sanitization, validation, OTP
└── catalog-data/            # IOBM course catalog JSON (2020–2026)
```

---

## Notification Pipeline

The notification system (`lib/notifications.ts`, `lib/notifications-send.ts`) runs via Vercel Cron 3× daily:

```
06:05 AM PKT  →  /api/cron/notify
12:05 PM PKT  →  /api/cron/notify
00:05 AM PKT  →  /api/cron/notify
```

Each run:
1. Queries deadlines needing reminders (3-day, 1-day, day-of windows) — 2 DB queries total, no N+1
2. Sends Resend email first; WhatsApp is independent and does not block email delivery
3. On email failure, rolls back the reminder timestamp atomically
4. Processes overdue deadlines (up to 3 overdue notices per deadline, spaced day-by-day)
5. Deduplicates WhatsApp messages with a DB-level `lastWhatsappSentAt` guard

Calendar re-sync runs separately (`/api/cron/refresh-calendars`) — processes users in batches of 10, deletes stale deadlines that are no longer in the ICS feed.

---

## Subscription Model

StayDue uses a manual payment model targeting Pakistani students:

- **Monthly** — PKR 300/month
- **Semester** — PKR 1,000/semester

Students submit a payment screenshot + transaction ID in-app. An admin reviews and activates the subscription. WhatsApp reminders are gated behind an active Pro subscription or a 7-day phone verification trial (one trial per phone number, enforced at the DB level).

---

## Running Locally

```bash
# Install dependencies
npm install

# Copy the environment variables file and fill in your values
cp .env.example .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

```
# MongoDB
MONGODB_URI=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# WhatsApp (Meta Business API)
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
WHATSAPP_TEMPLATE_REMINDER=
WHATSAPP_TEMPLATE_OVERDUE=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=

# Cloudflare R2
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Cron protection
CRON_SECRET=

# Admin
ADMIN_EMAILS=
```

---

## Security

- All API routes validate session before any logic executes — client-sent user IDs are never trusted
- WhatsApp webhook validates `X-Hub-Signature-256` HMAC signature on every request
- Password reset uses SHA256-hashed tokens with O(1) indexed lookup (no bcrypt timing leak)
- Rate limiting on all public-facing endpoints
- Zod schema validation on every API route input
- MongoDB queries use Mongoose schema validation — no raw user input passed as query operators
- Security headers set in `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`
- No PII in server logs (phone numbers masked, email addresses not logged after send)

---

## Built By

Talha Ahmad — IOBM student, Karachi, Pakistan.

Built to solve a real problem for real students. StayDue is a live product, not a portfolio project.

[staydue.app](https://staydue.app)
