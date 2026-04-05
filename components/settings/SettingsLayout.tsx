interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-page-card border border-line/50 rounded-xl p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-base font-medium text-text-primary mb-1">{title}</h2>
        <p className="text-sm text-text-muted mb-4">{description}</p>
        <div className="border-t border-line/50 mt-4 pt-4" />
      </div>
      <div>{children}</div>
    </div>
  );
}

interface SettingsLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsLayout({ title, children }: SettingsLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-2xl font-medium text-text-primary mb-8">{title}</h1>
      <div>{children}</div>
    </div>
  );
}
