import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  hasPaymentProof: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerEmail, customerName, orderTotal, orderItems, paymentMethod, hasPaymentProof }: OrderEmailRequest =
      await req.json();

    const ADMIN_EMAIL = "admin@mamelloskitchen.co.za"; // Update with actual admin email

    // Customer confirmation email
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #D97706; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .order-item { border-bottom: 1px solid #ddd; padding: 10px 0; }
            .total { font-size: 1.2em; font-weight: bold; color: #D97706; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>Thank you for your order! We've received your order and ${paymentMethod === "bank_transfer" ? "payment proof" : "will prepare it for delivery"}.</p>
              
              <h3>Order #${orderId.substring(0, 8).toUpperCase()}</h3>
              
              <div style="margin: 20px 0;">
                ${orderItems
                  .map(
                    (item) => `
                  <div class="order-item">
                    <strong>${item.name}</strong><br>
                    Quantity: ${item.quantity} × R${item.price.toFixed(2)} = R${(item.quantity * item.price).toFixed(2)}
                  </div>
                `
                  )
                  .join("")}
              </div>
              
              <div class="total">
                Total: R${orderTotal.toFixed(2)}
              </div>
              
              <p><strong>Payment Method:</strong> ${paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}</p>
              ${hasPaymentProof ? "<p>✓ Payment proof received and under review</p>" : ""}
              
              <p>We'll notify you once your order is ready for collection or delivery.</p>
            </div>
            <div class="footer">
              <p>Mamello's Kitchen<br>Contact us if you have any questions</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Admin notification email
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .order-item { border-bottom: 1px solid #ddd; padding: 10px 0; }
            .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Order Received</h1>
            </div>
            <div class="content">
              <h3>Order #${orderId.substring(0, 8).toUpperCase()}</h3>
              
              <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
              <p><strong>Payment Method:</strong> ${paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}</p>
              
              ${hasPaymentProof ? '<div class="alert">⚠️ Payment proof uploaded - please verify</div>' : ""}
              
              <h4>Order Items:</h4>
              ${orderItems
                .map(
                  (item) => `
                <div class="order-item">
                  <strong>${item.name}</strong><br>
                  Quantity: ${item.quantity} × R${item.price.toFixed(2)}
                </div>
              `
                )
                .join("")}
              
              <p style="font-size: 1.2em; font-weight: bold; margin-top: 20px;">
                Total: R${orderTotal.toFixed(2)}
              </p>
              
              <p style="margin-top: 20px;">
                <a href="https://your-domain.lovable.app/admin" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  View Order in Dashboard
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log(`Sending order confirmation emails for order ${orderId}`);
    console.log(`Customer: ${customerEmail}, Admin: ${ADMIN_EMAIL}`);
    console.log("Email sending would happen here - integrate with email service");

    // In production, you would integrate with an email service like Resend
    // For now, we'll just log the emails
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Order confirmation emails prepared",
        customerEmail,
        adminEmail: ADMIN_EMAIL,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
