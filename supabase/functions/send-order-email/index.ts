import { corsHeaders } from '../_shared/cors.ts';

interface OrderItem {
  productTitle: string;
  printType: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
}

type EmailType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled';

const printTypeLabels: Record<string, string> = {
  canvas: 'Canvas Print',
  roll: 'Rolled Print',
  framed: 'Framed Print',
};

function formatPrice(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}

function buildItemsTable(order: Order): string {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-family: Georgia, serif; font-size: 14px; color: #333;">
          ${item.productTitle}<br/>
          <span style="color: #888; font-size: 12px;">${printTypeLabels[item.printType] || item.printType} &bull; ${item.sizeLabel}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center; font-family: Georgia, serif; font-size: 14px; color: #333;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-family: Georgia, serif; font-size: 14px; color: #333;">
          ${formatPrice(item.unitPrice * item.quantity, order.currency)}
        </td>
      </tr>`
    )
    .join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <thead>
        <tr>
          <th style="padding: 8px 0; border-bottom: 2px solid #ddd; text-align: left; font-family: Georgia, serif; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Item</th>
          <th style="padding: 8px 0; border-bottom: 2px solid #ddd; text-align: center; font-family: Georgia, serif; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
          <th style="padding: 8px 0; border-bottom: 2px solid #ddd; text-align: right; font-family: Georgia, serif; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

function buildTotalsSection(order: Order): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 4px; margin: 20px 0;">
      <tr>
        <td style="padding: 16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 4px 0; font-family: Georgia, serif; font-size: 14px; color: #666;">Subtotal</td>
              <td style="padding: 4px 0; text-align: right; font-family: Georgia, serif; font-size: 14px; color: #333;">${formatPrice(order.subtotal, order.currency)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-family: Georgia, serif; font-size: 14px; color: #666;">Shipping</td>
              <td style="padding: 4px 0; text-align: right; font-family: Georgia, serif; font-size: 14px; color: #333;">${order.shipping_cost > 0 ? formatPrice(order.shipping_cost, order.currency) : 'TBD'}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 8px 0 0;"><hr style="border: none; border-top: 1px solid #ddd; margin: 0;"/></td>
            </tr>
            <tr>
              <td style="padding: 8px 0 4px; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #333;">Total</td>
              <td style="padding: 8px 0 4px; text-align: right; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #B8860B;">${formatPrice(order.total_amount, order.currency)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function buildAddressSection(order: Order): string {
  const addr = order.shipping_address;
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        <td style="padding: 16px 20px; background-color: #f9f9f9; border-radius: 4px;">
          <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</p>
          <p style="margin: 0; font-family: Georgia, serif; font-size: 14px; color: #333; line-height: 1.6;">
            ${order.customer_name}<br/>
            ${addr.address}<br/>
            ${addr.city}, ${addr.postalCode}<br/>
            ${addr.country}
          </p>
        </td>
      </tr>
    </table>`;
}

function buildEmailBody(
  order: Order,
  emailType: EmailType,
  trackingNumber?: string
): { subject: string; bodyContent: string } {
  const orderNum = order.order_number;

  switch (emailType) {
    case 'order_placed':
      return {
        subject: `Order Received — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            Thank you for your order, ${order.customer_name}!
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            We've received your order and will begin processing it shortly. You'll receive another email when your order is confirmed.
          </p>
          ${buildItemsTable(order)}
          ${buildTotalsSection(order)}
          ${buildAddressSection(order)}
        `,
      };

    case 'order_confirmed':
      return {
        subject: `Order Confirmed — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            Great news, ${order.customer_name}!
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            Your order has been confirmed and is being prepared. We'll notify you once it ships.
          </p>
          ${buildItemsTable(order)}
          ${buildTotalsSection(order)}
        `,
      };

    case 'order_shipped':
      return {
        subject: `Order Shipped — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            Your order is on its way, ${order.customer_name}!
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            Your order has been shipped and is heading to you.
          </p>
          ${
            trackingNumber
              ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
            <tr>
              <td style="padding: 16px 20px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px;">
                <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 12px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
                <p style="margin: 0; font-family: Georgia, serif; font-size: 16px; color: #1e40af; font-weight: bold;">${trackingNumber}</p>
              </td>
            </tr>
          </table>`
              : ''
          }
          ${buildItemsTable(order)}
          ${buildAddressSection(order)}
        `,
      };

    case 'order_delivered':
      return {
        subject: `Order Delivered — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            Your order has been delivered, ${order.customer_name}!
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            We hope you love your new artwork. If you have any questions, feel free to reach out to us.
          </p>
          ${buildItemsTable(order)}
        `,
      };

    case 'order_cancelled':
      return {
        subject: `Order Cancelled — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            Your order has been cancelled, ${order.customer_name}.
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            Order ${orderNum} has been cancelled. If you did not request this cancellation or have any questions, please contact us.
          </p>
          ${buildItemsTable(order)}
          ${buildTotalsSection(order)}
        `,
      };
  }
}

function wrapInLayout(body: string, orderNumber: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0A0A0A; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: 400; letter-spacing: 6px; color: #FBBE63;">DYSNOMIA</h1>
            </td>
          </tr>
          <!-- Order Number Badge -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px 40px 0; text-align: center;">
              <span style="display: inline-block; padding: 6px 16px; background-color: #f0f0f0; border-radius: 4px; font-family: Georgia, serif; font-size: 13px; color: #B8860B; letter-spacing: 1px;">
                ORDER ${orderNumber}
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px 40px 40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 12px; color: #999;">
                &copy; ${new Date().getFullYear()} DYSNOMIA Art Gallery. All rights reserved.
              </p>
              <p style="margin: 0; font-family: Georgia, serif; font-size: 11px; color: #bbb;">
                This email was sent regarding your order. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmail(
  order: Order,
  emailType: EmailType,
  trackingNumber?: string
): { subject: string; html: string } {
  const { subject, bodyContent } = buildEmailBody(order, emailType, trackingNumber);
  const html = wrapInLayout(bodyContent, order.order_number);
  return { subject, html };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order, emailType, trackingNumber } = await req.json();

    // Validate required fields
    if (!order || !emailType) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing order or emailType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!order.customer_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing customer email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'DYSNOMIA <orders@dysnomia.art>';

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { subject, html } = buildEmail(order, emailType, trackingNumber);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [order.customer_email],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error('Resend API error:', resendResponse.status, errorBody);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('send-order-email error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


