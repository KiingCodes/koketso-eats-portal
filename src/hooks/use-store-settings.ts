import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BankDetails,
  BusinessHours,
  NotificationPreferences,
  DEFAULT_BANK_DETAILS,
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/types/settings";

export function useStoreSettings() {
  const [bankDetails, setBankDetails] = useState<BankDetails>(DEFAULT_BANK_DETAILS);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("store_settings")
        .select("key, value");

      if (data) {
        for (const row of data as { key: string; value: Record<string, unknown> }[]) {
          if (row.key === "bank_details") {
            setBankDetails({ ...DEFAULT_BANK_DETAILS, ...(row.value as BankDetails) });
          } else if (row.key === "business_hours") {
            setBusinessHours({ ...DEFAULT_BUSINESS_HOURS, ...(row.value as BusinessHours) });
          } else if (row.key === "notification_preferences") {
            setNotificationPreferences({
              ...DEFAULT_NOTIFICATION_PREFERENCES,
              ...(row.value as NotificationPreferences),
            });
          }
        }
      }
    } catch {
      // Silently fail — use defaults
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("store_settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) throw new Error(error.message);

    if (key === "bank_details") setBankDetails(value as unknown as BankDetails);
    if (key === "business_hours") setBusinessHours(value as unknown as BusinessHours);
    if (key === "notification_preferences")
      setNotificationPreferences(value as unknown as NotificationPreferences);
  };

  return { bankDetails, businessHours, notificationPreferences, loading, saveSetting };
}
