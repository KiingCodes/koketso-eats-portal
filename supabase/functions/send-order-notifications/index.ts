import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, eventType, paymentStatus } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch notification preferences from store settings
    const { data: settingsRows } = await supabaseAdmin
      .from("store_settings")
      .select("key, value")
      .eq("key", "notification_preferences");

    const notifPrefs = (settingsRows?.[0]?.value as Record<string, unknown>) ?? {};
    const fromName = (notifPrefs.from_name as string) || "Mamello's Kitchen";
    const fromEmail = (notifPrefs.from_email as string) || "orders@resend.dev";
    const supportEmail = (notifPrefs.support_email as string) || "support@mamelloskitchen.com";
    const adminEmail = (notifPrefs.admin_email as string) || null;
    const shouldSendOrderConfirmation = notifPrefs.send_order_confirmation !== false;
    const shouldSendPaymentVerification = notifPrefs.send_payment_verification !== false;

    // Check if this notification type is enabled
    if (eventType === "order_placed" && !shouldSendOrderConfirmation) {
      return new Response(JSON.stringify({ success: true, skipped: "order confirmation disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (eventType === "payment_verification" && !shouldSendPaymentVerification) {
      return new Response(JSON.stringify({ success: true, skipped: "payment verification disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    if (userError || !user?.email) {
      throw new Error("User email not found");
    }

    // Get user profile for personalization
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("user_id", order.user_id)
      .single();

    const customerName = profile?.full_name || user.email.split("@")[0];

    let subject = "";
    let html = "";

    if (eventType === "order_placed") {
      subject = `Order Confirmation - ${fromName} #${orderId.slice(0, 8)}`;
      html = generateOrderConfirmationEmail(order, customerName, fromName, supportEmail);
    } else if (eventType === "payment_verification") {
      subject = paymentStatus === "verified"
        ? `Payment Verified - Order #${orderId.slice(0, 8)}`
        : `Payment Issue - Order #${orderId.slice(0, 8)}`;
      html = generatePaymentStatusEmail(order, customerName, paymentStatus, fromName, supportEmail);
    }

    // Build BCC list for admin copy
    const bccList = adminEmail ? [adminEmail] : undefined;

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [user.email],
        ...(bccList && { bcc: bccList }),
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Resend error: ${error}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateOrderConfirmationEmail(
  order: any,
  customerName: string,
  brandName: string,
  supportEmail: string
): string {
  const itemsHtml = order.order_items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <div style="font-weight: 500; color: #1a1a1a;">${item.product_name}</div>
        <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 500; color: #d97706;">
        R${(item.unit_price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 40px 20px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
          🥖 ${brandName}
        </h1>
        <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px;">
          Homemade Goodness, Delivered Fresh
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px;">
        <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
          Thank you, ${customerName}! 🎉
        </h2>
        <p style="margin: 0 0 24px 0; color: #666; font-size: 16px; line-height: 1.5;">
          We've received your order and we're getting ready to prepare your delicious items.
        </p>
        <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 16px 20px; margin-bottom: 32px; border-radius: 4px;">
          <div style="color: #92400e; font-size: 14px; font-weight: 500; margin-bottom: 4px;">ORDER NUMBER</div>
          <div style="color: #1a1a1a; font-size: 18px; font-weight: 700;">#${order.id.slice(0, 8).toUpperCase()}</div>
        </div>
        <h3 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">Order Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 16px 0; font-weight: 600; font-size: 18px; color: #1a1a1a;">Total</td>
            <td style="padding: 16px 0; text-align: right; font-weight: 700; font-size: 20px; color: #d97706;">
              R${order.total.toFixed(2)}
            </td>
          </tr>
        </table>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <div style="color: #666; font-size: 14px; margin-bottom: 4px;">Payment Method</div>
          <div style="color: #1a1a1a; font-weight: 500;">
            ${order.payment_method === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}
          </div>
          ${order.payment_method === "bank_transfer" ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <div style="color: #d97706; font-size: 14px; font-weight: 500;">⏳ Awaiting payment verification</div>
          </div>
          ` : ""}
        </div>
        ${order.notes ? `
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <div style="color: #666; font-size: 14px; margin-bottom: 4px;">Special Instructions</div>
          <div style="color: #1a1a1a;">${order.notes}</div>
        </div>
        ` : ""}
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 8px; margin-top: 32px;">
          <h4 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">What's Next?</h4>
          <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            ${order.payment_method === "bank_transfer" ? `
            <li style="margin-bottom: 8px;">We'll verify your payment proof</li>
            <li style="margin-bottom: 8px;">Once verified, we'll start preparing your order</li>
            ` : `
            <li style="margin-bottom: 8px;">We'll start preparing your order right away</li>
            `}
            <li style="margin-bottom: 8px;">You'll receive updates as your order progresses</li>
            <li>Your delicious food will be on its way soon!</li>
          </ul>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 32px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
          Questions? Contact us at <a href="mailto:${supportEmail}" style="color: #d97706;">${supportEmail}</a>
        </p>
        <p style="margin: 0; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} ${brandName}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generatePaymentStatusEmail(
  order: any,
  customerName: string,
  status: string,
  brandName: string,
  supportEmail: string
): string {
  const isVerified = status === "verified";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment ${isVerified ? "Verified" : "Update"}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, ${isVerified ? "#d97706" : "#dc2626"} 0%, ${isVerified ? "#f59e0b" : "#ef4444"} 100%); padding: 40px 20px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
          🥖 ${brandName}
        </h1>
        <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px;">
          Payment ${isVerified ? "Verified" : "Update"}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px;">
        <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
          Hi ${customerName},
        </h2>
        ${isVerified ? `
        <p style="margin: 0 0 24px 0; color: #666; font-size: 16px; line-height: 1.5;">
          Great news! We've verified your payment and your order is now being prepared. 🎉
        </p>
        <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 32px; border-radius: 4px;">
          <div style="display: flex; align-items: center;">
            <div style="font-size: 32px; margin-right: 16px;">✅</div>
            <div>
              <div style="color: #065f46; font-weight: 600; font-size: 16px; margin-bottom: 4px;">Payment Verified</div>
              <div style="color: #047857; font-size: 14px;">Order #${order.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 8px;">
          <h4 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">What's Next?</h4>
          <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            <li style="margin-bottom: 8px;">Your order is now in our kitchen</li>
            <li style="margin-bottom: 8px;">We're preparing your delicious items with care</li>
            <li>You'll be notified when your order is ready for delivery</li>
          </ul>
        </div>
        ` : `
        <p style="margin: 0 0 24px 0; color: #666; font-size: 16px; line-height: 1.5;">
          We've reviewed your payment proof for order #${order.id.slice(0, 8).toUpperCase()}, but we need some clarification.
        </p>
        <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 32px; border-radius: 4px;">
          <div style="display: flex; align-items: center;">
            <div style="font-size: 32px; margin-right: 16px;">⚠️</div>
            <div>
              <div style="color: #991b1b; font-weight: 600; font-size: 16px; margin-bottom: 4px;">Payment Verification Issue</div>
              <div style="color: #dc2626; font-size: 14px;">Please contact us to resolve this</div>
            </div>
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px;">
          <h4 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">What to Do Next</h4>
          <p style="margin: 0 0 16px 0; color: #666; font-size: 14px; line-height: 1.5;">
            Please reach out to us at <a href="mailto:${supportEmail}" style="color: #d97706; text-decoration: none;">${supportEmail}</a>
            or call us to clarify your payment details. We're here to help!
          </p>
        </div>
        `}
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <h4 style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500;">ORDER TOTAL</h4>
          <div style="color: #d97706; font-size: 24px; font-weight: 700;">R${order.total.toFixed(2)}</div>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 32px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
          Questions? Contact us at <a href="mailto:${supportEmail}" style="color: #d97706;">${supportEmail}</a>
        </p>
        <p style="margin: 0; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} ${brandName}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
