import PageTransition from "@/components/shared/PageTransition";
import NavbarButton from "@/components/shared/NavbarButton";

export default function Home(): React.ReactElement {
  return (
    <PageTransition>
      <nav className="h-14 border-b border-line/50 bg-page-surface/80 backdrop-blur-sm sticky top-0 z-50 flex items-center px-6 gap-4">
        <div className="text-sm font-medium text-text-primary">StayDue</div>
        <div className="ml-auto flex items-center gap-3">
          <NavbarButton href="/login" variant="secondary">
            Sign in
          </NavbarButton>
          <NavbarButton href="/signup" variant="primary">
            Create account
          </NavbarButton>
        </div>
      </nav>
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-12 md:py-16">
        <section className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Student Deadline Manager
            </p>
            <h1 className="text-3xl md:text-4xl font-medium leading-tight text-text-primary">
              Never miss a university deadline again.
            </h1>
            <p className="max-w-2xl text-base text-text-secondary leading-relaxed">
              Connect your Moodle calendar and get assignment deadlines organized in one dashboard, then receive reminders via WhatsApp and email before due dates.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <NavbarButton href="/signup" variant="primary">
              Get started
            </NavbarButton>
            <NavbarButton href="/login" variant="secondary">
              Sign in
            </NavbarButton>
          </div>
        </section>

        <section className="mt-16 pb-12">
          <h2 className="text-lg font-medium text-text-primary mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-page-card border border-line/50 rounded-xl p-5">
              <p className="text-sm font-medium text-text-muted mb-2">Step 1</p>
              <h3 className="text-base font-medium text-text-primary mb-2">Connect Moodle</h3>
              <p className="text-sm text-text-secondary">Paste your Moodle calendar export URL to fetch all your assignments.</p>
            </div>
            <div className="bg-page-card border border-line/50 rounded-xl p-5">
              <p className="text-sm font-medium text-text-muted mb-2">Step 2</p>
              <h3 className="text-base font-medium text-text-primary mb-2">View Dashboard</h3>
              <p className="text-sm text-text-secondary">See all your deadlines organized by urgency in a single view.</p>
            </div>
            <div className="bg-page-card border border-line/50 rounded-xl p-5">
              <p className="text-sm font-medium text-text-muted mb-2">Step 3</p>
              <h3 className="text-base font-medium text-text-primary mb-2">Get Reminders</h3>
              <p className="text-sm text-text-secondary">Receive WhatsApp and email notifications before your assignments are due.</p>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
