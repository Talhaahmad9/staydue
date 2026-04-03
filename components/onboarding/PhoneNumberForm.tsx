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
    <div className="w-full max-w-xl space-y-2 rounded-2xl border border-gray-200 bg-white p-6">
      <label htmlFor="phone" className="text-sm font-medium text-gray-700">
        WhatsApp number (optional for now)
      </label>
      <input
        id="phone"
        type="tel"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
        placeholder="+923001234567"
      />
      <p className="text-sm text-gray-500">We will use this later for reminder delivery.</p>
    </div>
  );
}
