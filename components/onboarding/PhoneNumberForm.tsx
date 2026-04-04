"use client";

interface PhoneNumberFormProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PhoneNumberForm({
  value,
  onChange,
}: PhoneNumberFormProps): React.ReactElement {
  return (
    <div className="w-full max-w-xl rounded-xl border border-line/50 bg-page-card p-6 space-y-4">
      <div>
        <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-widest text-text-muted mb-2">
          WhatsApp number (optional)
        </label>
        <input
          id="phone"
          type="tel"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-line bg-page-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="+923001234567"
        />
      </div>
      <p className="text-sm text-text-secondary">We will use this later for reminder delivery.</p>
    </div>
  );
}
