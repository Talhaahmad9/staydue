import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectToDatabase, UserModel } from "@/lib/mongodb";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import AccountSettings from "@/components/settings/AccountSettings";
import CalendarSettings from "@/components/settings/CalendarSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import DangerZone from "@/components/settings/DangerZone";

export const metadata = {
  title: "Settings — StayDue",
  description: "Manage your StayDue account and notification settings",
};

export interface SettingsUserData {
  id: string;
  name: string;
  email: string;
  isGoogleUser: boolean;
  moodleCalendarUrl: string;
  updatedAt: string | null;
  phone: string;
  isPhoneVerified: boolean;
  notificationPreferences: {
    emailEnabled: boolean;
    reminderIntervals: string[];
  };
}

export default async function SettingsPage(): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await UserModel.findById(session.user.id).lean();

  if (!user) {
    redirect("/login");
  }

  const userData: SettingsUserData = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isGoogleUser: !user.passwordHash || user.passwordHash === "",
    moodleCalendarUrl: user.moodleCalendarUrl ?? "",
    updatedAt: user.updatedAt?.toISOString() ?? null,
    phone: user.phone ?? "",
    isPhoneVerified: user.isPhoneVerified ?? false,
    notificationPreferences: {
      emailEnabled: user.notificationPreferences?.emailEnabled ?? true,
      reminderIntervals: user.notificationPreferences?.reminderIntervals ?? ["3-day", "1-day", "day-of"],
    },
  };

  return (
    <SettingsLayout title="Settings">
      <AccountSettings user={userData} />
      <CalendarSettings user={userData} />
      <NotificationSettings user={userData} />
      <BillingSettings />
      <DangerZone />
    </SettingsLayout>
  );
}
