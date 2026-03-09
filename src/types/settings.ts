export interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_code: string;
  reference_prefix: string;
}

export interface DayHours {
  open: string;
  close: string;
  is_open: boolean;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface NotificationPreferences {
  send_order_confirmation: boolean;
  send_payment_verification: boolean;
  admin_email: string;
  from_name: string;
  from_email: string;
  support_email: string;
}

export const DEFAULT_BANK_DETAILS: BankDetails = {
  bank_name: "First National Bank (FNB)",
  account_name: "Mamello's Kitchen",
  account_number: "62 8765 4321 0",
  branch_code: "250655",
  reference_prefix: "ORDER",
};

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { open: "08:00", close: "20:00", is_open: true },
  tuesday: { open: "08:00", close: "20:00", is_open: true },
  wednesday: { open: "08:00", close: "20:00", is_open: true },
  thursday: { open: "08:00", close: "20:00", is_open: true },
  friday: { open: "08:00", close: "20:00", is_open: true },
  saturday: { open: "09:00", close: "17:00", is_open: true },
  sunday: { open: "10:00", close: "15:00", is_open: false },
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  send_order_confirmation: true,
  send_payment_verification: true,
  admin_email: "",
  from_name: "Mamello's Kitchen",
  from_email: "orders@resend.dev",
  support_email: "support@mamelloskitchen.com",
};
