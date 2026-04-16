import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

interface StaticPageLayoutProps {
  children: React.ReactNode;
}

export default function StaticPageLayout({
  children,
}: StaticPageLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <LandingNav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-12 md:py-16">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
