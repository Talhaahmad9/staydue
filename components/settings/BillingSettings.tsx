import SettingsSection from "./SettingsLayout";

export default function BillingSettings(): React.ReactElement {
  return (
    <SettingsSection title="Billing" description="Manage your subscription and billing">
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-8 h-8 mb-4 text-brand opacity-70">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        <span className="inline-block bg-brand-light border border-brand/40 text-brand text-xs px-2.5 py-0.5 rounded-full font-medium mb-3">
          Free plan
        </span>

        <h3 className="text-base font-medium text-text-primary mb-2">Billing</h3>
        <p className="text-sm text-text-muted max-w-sm mb-6">
          Upgrade options will be available here soon.
        </p>

        <button
          disabled
          className="bg-page-surface border border-line text-text-disabled text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
        >
          Upgrade plan
        </button>
      </div>
    </SettingsSection>
  );
}
