import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://staydue.app"),
  title: {
    default: "StayDue — Never miss a university deadline",
    template: "%s | StayDue",
  },
  description:
    "StayDue syncs your IOBM Moodle deadlines and sends WhatsApp and email reminders before every due date. Never miss an assignment again.",
  keywords: [
    "IOBM deadlines",
    "Moodle reminders",
    "university deadline tracker",
    "assignment reminders Pakistan",
    "StayDue",
  ],
  openGraph: {
    type: "website",
    siteName: "StayDue",
    url: "https://staydue.app",
    title: "StayDue — Never miss a university deadline",
    description:
      "Sync your IOBM Moodle deadlines and get WhatsApp and email reminders before every due date.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "StayDue — deadline reminders for university students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StayDue — Never miss a university deadline",
    description:
      "Sync your IOBM Moodle deadlines and get WhatsApp and email reminders before every due date.",
    images: ["/opengraph-image.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
