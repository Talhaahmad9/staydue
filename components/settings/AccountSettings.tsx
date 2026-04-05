"use client";

import { useState } from "react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";
import SettingsSection from "./SettingsLayout";
import { Eye, EyeOff } from "lucide-react";
import type { SettingsUserData } from "@/app/settings/page";

interface AccountSettingsProps {
  user: SettingsUserData;
}

export default function AccountSettings({ user }: AccountSettingsProps): React.ReactElement {
  const [name, setName] = useState(user.name);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const isGoogleUser = user.isGoogleUser;

  async function handleNameSave(): Promise<void> {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    if (name === user.name) {
      return;
    }

    setNameSaving(true);
    setNameError(null);
    setNameSuccess(false);

    try {
      const response = await fetch("/api/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update name");
      }

      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (error) {
      setNameError(error instanceof Error ? error.message : "Could not update name");
    } finally {
      setNameSaving(false);
    }
  }

  async function handlePasswordChange(): Promise<void> {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword.trim()) {
      setPasswordError("Current password is required");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch("/api/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword,
        }),
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Could not change password");
    } finally {
      setPasswordSaving(false);
    }
  }

  function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-urgency-today" };
    if (score <= 4) return { score, label: "Fair", color: "bg-urgency-tomorrow" };
    return { score, label: "Strong", color: "bg-brand" };
  }

  const passwordStrength = newPassword ? calculatePasswordStrength(newPassword) : null;

  return (
    <SettingsSection title="Account" description="Manage your account settings">
      <div className="space-y-8">
        {/* Name */}
        <div className="space-y-3">
          <label className="block text-xs font-medium uppercase tracking-widest text-text-muted">
            Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-page-surface border border-line focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors"
            />
            <button
              onClick={handleNameSave}
              disabled={nameSaving || name === user.name}
              className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
            >
              {nameSaving ? <ButtonLoader /> : "Save"}
            </button>
          </div>
          {nameError && <p className="text-sm text-urgency-todayText">{nameError}</p>}
          {nameSuccess && <p className="text-sm text-urgency-doneText">Name updated</p>}
        </div>

        {/* Email */}
        <div className="space-y-3">
          <label className="block text-xs font-medium uppercase tracking-widest text-text-muted">
            Email
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={user.email}
              disabled
              className="flex-1 bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-muted outline-none cursor-not-allowed"
            />
            {isGoogleUser && (
              <span className="bg-brand-light border border-brand/40 text-brand text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                Google
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted">To change your email contact support.</p>
        </div>

        {/* Password Change (only for non-Google users) */}
        {!isGoogleUser && (
          <div className="space-y-3 border-t border-line/50 pt-6">
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-text-muted mb-3">
                Change password
              </label>

              {/* Current Password */}
              <div className="space-y-2 mb-4">
                <label htmlFor="current-pwd" className="block text-xs text-text-muted">
                  Current password
                </label>
                <div className="relative">
                  <input
                    id="current-pwd"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-page-surface border border-line focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={passwordSaving}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Toggle password visibility"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2 mb-4">
                <label htmlFor="new-pwd" className="block text-xs text-text-muted">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-pwd"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-page-surface border border-line focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={passwordSaving}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {newPassword && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">Strength:</span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength?.color === "bg-urgency-today"
                            ? "text-urgency-todayText"
                            : passwordStrength?.color === "bg-urgency-tomorrow"
                              ? "text-urgency-tomorrowText"
                              : "text-brand"
                        }`}
                      >
                        {passwordStrength?.label}
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-line overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength?.color}`}
                        style={{ width: `${((passwordStrength?.score ?? 0) / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 mb-4">
                <label htmlFor="confirm-pwd" className="block text-xs text-text-muted">
                  Confirm new password
                </label>
                <input
                  id="confirm-pwd"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-page-surface border border-line focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
              >
                {passwordSaving ? <ButtonLoader /> : "Update"}
              </button>

              {passwordError && <p className="text-sm text-urgency-todayText mt-3">{passwordError}</p>}
              {passwordSuccess && <p className="text-sm text-urgency-doneText mt-3">Password updated</p>}
            </div>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
