import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Building2, Clock, Bell, ArrowLeft, Save, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useStoreSettings } from "@/hooks/use-store-settings";
import {
  BankDetails,
  BusinessHours,
  NotificationPreferences,
  DEFAULT_BANK_DETAILS,
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/types/settings";

const DAYS: Array<keyof BusinessHours> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<keyof BusinessHours, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function AdminSettings() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const {
    bankDetails: loadedBank,
    businessHours: loadedHours,
    notificationPreferences: loadedNotifs,
    loading: settingsLoading,
    saveSetting,
  } = useStoreSettings();

  const [bank, setBank] = useState<BankDetails>(DEFAULT_BANK_DETAILS);
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);
  const [notifs, setNotifs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [saving, setSaving] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Access denied");
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  // Sync editable state once settings are fetched
  useEffect(() => {
    if (!settingsLoading && !initialized) {
      setBank({ ...loadedBank });
      setHours({ ...loadedHours });
      setNotifs({ ...loadedNotifs });
      setInitialized(true);
    }
  }, [settingsLoading, loadedBank, loadedHours, loadedNotifs, initialized]);

  const saveBankDetails = async () => {
    setSaving("bank");
    try {
      await saveSetting("bank_details", bank as unknown as Record<string, unknown>);
      toast.success("Bank details saved!");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save bank details");
    } finally {
      setSaving(null);
    }
  };

  const saveBusinessHours = async () => {
    setSaving("hours");
    try {
      await saveSetting("business_hours", hours as unknown as Record<string, unknown>);
      toast.success("Business hours saved!");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save business hours");
    } finally {
      setSaving(null);
    }
  };

  const saveNotifications = async () => {
    setSaving("notifs");
    try {
      await saveSetting("notification_preferences", notifs as unknown as Record<string, unknown>);
      toast.success("Notification preferences saved!");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save notification preferences");
    } finally {
      setSaving(null);
    }
  };

  const updateHours = (
    day: keyof BusinessHours,
    field: keyof DayHours,
    value: string | boolean
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 mt-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">Store Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure your store preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="bank">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bank" className="gap-1.5">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Bank Details</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Hours</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* ─── Bank Details ─── */}
          <TabsContent value="bank" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Bank Account Details
                </CardTitle>
                <CardDescription>
                  Shown to customers when they choose bank transfer as their payment method.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={bank.bank_name}
                    onChange={(e) => setBank({ ...bank, bank_name: e.target.value })}
                    placeholder="e.g. First National Bank (FNB)"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    value={bank.account_name}
                    onChange={(e) => setBank({ ...bank, account_name: e.target.value })}
                    placeholder="e.g. Mamello's Kitchen"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      value={bank.account_number}
                      onChange={(e) => setBank({ ...bank, account_number: e.target.value })}
                      placeholder="e.g. 62 8765 4321 0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="branch-code">Branch Code</Label>
                    <Input
                      id="branch-code"
                      value={bank.branch_code}
                      onChange={(e) => setBank({ ...bank, branch_code: e.target.value })}
                      placeholder="e.g. 250655"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ref-prefix">Reference Prefix</Label>
                  <Input
                    id="ref-prefix"
                    value={bank.reference_prefix}
                    onChange={(e) => setBank({ ...bank, reference_prefix: e.target.value })}
                    placeholder="e.g. ORDER"
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers will use{" "}
                    <strong>{bank.reference_prefix || "ORDER"}</strong>
                    -[order ID] as their payment reference.
                  </p>
                </div>

                <Separator />

                {/* Preview */}
                <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Preview
                  </p>
                  {(
                    [
                      ["Bank", bank.bank_name],
                      ["Account Name", bank.account_name],
                      ["Account Number", bank.account_number],
                      ["Branch Code", bank.branch_code],
                    ] as [string, string][]
                  ).map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{val || "—"}</span>
                    </div>
                  ))}
                </div>

                <Button onClick={saveBankDetails} disabled={saving === "bank"} className="w-full">
                  {saving === "bank" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Bank Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Business Hours ─── */}
          <TabsContent value="hours" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Business Hours
                </CardTitle>
                <CardDescription>
                  Set your operating hours for each day of the week.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Switch
                      checked={hours[day].is_open}
                      onCheckedChange={(v) => updateHours(day, "is_open", v)}
                    />
                    <span className="w-24 text-sm font-medium shrink-0">
                      {DAY_LABELS[day]}
                    </span>
                    {hours[day].is_open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={hours[day].open}
                          onChange={(e) => updateHours(day, "open", e.target.value)}
                          className="w-32 h-8 text-sm"
                        />
                        <span className="text-muted-foreground text-xs shrink-0">to</span>
                        <Input
                          type="time"
                          value={hours[day].close}
                          onChange={(e) => updateHours(day, "close", e.target.value)}
                          className="w-32 h-8 text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Closed</span>
                    )}
                  </div>
                ))}

                <Button
                  onClick={saveBusinessHours}
                  disabled={saving === "hours"}
                  className="w-full mt-2"
                >
                  {saving === "hours" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Business Hours
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Notifications ─── */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure email notifications sent to customers and administrators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Triggers */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Email Triggers</Label>
                  {(
                    [
                      {
                        key: "send_order_confirmation" as const,
                        label: "Order Confirmation",
                        desc: "Send email when a new order is placed",
                      },
                      {
                        key: "send_payment_verification" as const,
                        label: "Payment Verification Update",
                        desc: "Send email when payment is verified or rejected",
                      },
                    ] as { key: keyof NotificationPreferences; label: string; desc: string }[]
                  ).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={notifs[key] as boolean}
                        onCheckedChange={(v) => setNotifs({ ...notifs, [key]: v })}
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Sender */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Sender Details</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="from-name" className="text-xs">
                        From Name
                      </Label>
                      <Input
                        id="from-name"
                        value={notifs.from_name}
                        onChange={(e) => setNotifs({ ...notifs, from_name: e.target.value })}
                        placeholder="Mamello's Kitchen"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="from-email" className="text-xs">
                        From Email
                      </Label>
                      <Input
                        id="from-email"
                        type="email"
                        value={notifs.from_email}
                        onChange={(e) => setNotifs({ ...notifs, from_email: e.target.value })}
                        placeholder="orders@yourdomain.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="support-email" className="text-xs">
                      Support Email
                    </Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={notifs.support_email}
                      onChange={(e) => setNotifs({ ...notifs, support_email: e.target.value })}
                      placeholder="support@yourdomain.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown in email footers for customer inquiries.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Admin copy */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Admin Notifications</Label>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-email" className="text-xs">
                      Admin Email (BCC)
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={notifs.admin_email}
                      onChange={(e) => setNotifs({ ...notifs, admin_email: e.target.value })}
                      placeholder="admin@yourdomain.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Receive a blind copy of all order notifications. Leave blank to disable.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={saveNotifications}
                  disabled={saving === "notifs"}
                  className="w-full"
                >
                  {saving === "notifs" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notification Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// needed for the updateHours helper
type DayHours = {
  open: string;
  close: string;
  is_open: boolean;
};
