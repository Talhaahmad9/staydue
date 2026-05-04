import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "About", href: "/about" },
  { label: "How to get your URL", href: "/how-to-get-url" },
];

export default function LandingFooter(): React.ReactElement {
  return (
    <footer className="border-t border-line/50 bg-page-surface">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src="/staydue_logo.svg"
            alt="StayDue"
            width={220}
            height={72}
            className="h-auto opacity-80 w-[95px] md:w-[110px] lg:w-[140px]"
          />
        </Link>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-text-muted shrink-0">
          © {new Date().getFullYear()} StayDue
        </p>
      </div>
    </footer>
  );
}
