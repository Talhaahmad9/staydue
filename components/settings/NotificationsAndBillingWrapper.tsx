"use client";

import { useState } from "react";
import NotificationSettings from "./NotificationSettings";
import BillingSettings from "./BillingSettings";
import type { SettingsUserData } from "@/app/settings/page";

interface NotificationsAndBillingWrapperProps {
  user: SettingsUserData;
}

export default function NotificationsAndBillingWrapper({ user }: NotificationsAndBillingWrapperProps): React.ReactElement {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <NotificationSettings user={user} onPhoneVerified={() => setRefreshKey((k) => k + 1)} />
      <BillingSettings refreshKey={refreshKey} />
    </>
  );
}
