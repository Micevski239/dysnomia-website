import { getCorsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

const printTypeLabels: Record<string, [string, string]> = {
  canvas: ['Canvas Print', 'Канвас'],
  roll: ['Rolled Print', 'Платно во ролна'],
  framed: ['Framed Print', 'Врамена слика'],
};

// Language of the email being built. Set synchronously right before buildEmail()
// (which is synchronous), so concurrent requests cannot interleave.
let emailLang: 'mk' | 'en' = 'mk';
const tr = (en: string, mk: string) => (emailLang === 'mk' ? mk : en);

// Escape HTML to prevent XSS in email templates
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatPrice(amount: number, currency: string): string {
  return `${Number(amount).toLocaleString()} ${escapeHtml(String(currency))}`;
}

function buildItemsTable(order: Order): string {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-family: Georgia, serif; font-size: 14px; color: #333;">
          ${escapeHtml(item.productTitle)}<br/>
          <span style="color: #888; font-size: 12px;">${escapeHtml(printTypeLabels[item.printType] ? tr(...printTypeLabels[item.printType]) : item.printType)} &bull; ${escapeHtml(item.sizeLabel)}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center; font-family: Georgia, serif; font-size: 14px; color: #333;">
          ${Number(item.quantity)}
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
          <th style="padding: 8px 0; border-bottom: 2px solid #ddd; text-align: left; font-family: Georgia, serif; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">${tr('Item', 'Производ')}</th>
          <th style="padding: 8px 0; border-bottom: 2px solid #ddd; text-align: center; font-family: Georgia, serif; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">${tr('Qty', 'Кол.')}</th>
          <th style="padding: 8px 0; border-bottom: 2px solid #ddd; text-align: right; font-family: Georgia, serif; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">${tr('Total', 'Вкупно')}</th>
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
              <td style="padding: 4px 0; font-family: Georgia, serif; font-size: 14px; color: #666;">${tr('Subtotal', 'Меѓузбир')}</td>
              <td style="padding: 4px 0; text-align: right; font-family: Georgia, serif; font-size: 14px; color: #333;">${formatPrice(order.subtotal, order.currency)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-family: Georgia, serif; font-size: 14px; color: #666;">${tr('Shipping', 'Достава')}</td>
              <td style="padding: 4px 0; text-align: right; font-family: Georgia, serif; font-size: 14px; color: #333;">${order.shipping_cost > 0 ? formatPrice(order.shipping_cost, order.currency) : tr('TBD', 'Ќе се потврди')}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 8px 0 0;"><hr style="border: none; border-top: 1px solid #ddd; margin: 0;"/></td>
            </tr>
            <tr>
              <td style="padding: 8px 0 4px; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #333;">${tr('Total', 'Вкупно')}</td>
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
          <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">${tr('Shipping Address', 'Адреса за достава')}</p>
          <p style="margin: 0; font-family: Georgia, serif; font-size: 14px; color: #333; line-height: 1.6;">
            ${escapeHtml(order.customer_name)}<br/>
            ${escapeHtml(addr.address)}<br/>
            ${escapeHtml(addr.city)}, ${escapeHtml(addr.postalCode)}<br/>
            ${escapeHtml(addr.country)}
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
  const orderNum = escapeHtml(String(order.order_number));

  switch (emailType) {
    case 'order_placed':
      return {
        subject: `${tr('Order Received', 'Нарачката е примена')} — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            ${tr('Thank you for your order', 'Ви благодариме за нарачката')}, ${escapeHtml(order.customer_name)}!
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            ${tr("We've received your order and will begin processing it shortly. You'll receive another email when your order is confirmed.", 'Ја примивме вашата нарачка и наскоро ќе почнеме со обработка. Ќе добиете нова порака кога нарачката ќе биде потврдена.')}
          </p>
          ${buildItemsTable(order)}
          ${buildTotalsSection(order)}
          ${buildAddressSection(order)}
        `,
      };

    case 'order_confirmed':
      return {
        subject: `${tr('Order Confirmed', 'Нарачката е потврдена')} — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            ${tr('Great news', 'Одлични вести')}, ${escapeHtml(order.customer_name)}!
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            ${tr("Your order has been confirmed and is being prepared. We'll notify you once it ships.", 'Вашата нарачка е потврдена и се подготвува. Ќе ве известиме кога ќе биде испратена.')}
          </p>
          ${buildItemsTable(order)}
          ${buildTotalsSection(order)}
        `,
      };

    case 'order_shipped':
      return {
        subject: `${tr('Order Shipped', 'Нарачката е испратена')} — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            ${tr('Your order is on its way', 'Вашата нарачка е на пат')}, ${escapeHtml(order.customer_name)}!
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            ${tr('Your order has been shipped and is heading to you.', 'Нарачката е испратена и пристигнува кај вас.')}
          </p>
          ${
            trackingNumber
              ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
            <tr>
              <td style="padding: 16px 20px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px;">
                <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 12px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">${tr('Tracking Number', 'Број за следење')}</p>
                <p style="margin: 0; font-family: Georgia, serif; font-size: 16px; color: #1e40af; font-weight: bold;">${escapeHtml(trackingNumber || '')}</p>
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
        subject: `${tr('Order Delivered', 'Нарачката е доставена')} — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            ${tr('Your order has been delivered', 'Вашата нарачка е доставена')}, ${escapeHtml(order.customer_name)}!
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            ${tr('We hope you love your new artwork. If you have any questions, feel free to reach out to us.', 'Се надеваме дека ќе уживате во новото уметничко дело. За прашања слободно контактирајте нè.')}
          </p>
          ${buildItemsTable(order)}
        `,
      };

    case 'order_cancelled':
      return {
        subject: `${tr('Order Cancelled', 'Нарачката е откажана')} — ${orderNum}`,
        bodyContent: `
          <p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px;">
            ${tr('Your order has been cancelled', 'Вашата нарачка е откажана')}, ${escapeHtml(order.customer_name)}.
          </p>
          <p style="font-family: Georgia, serif; font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px;">
            ${tr('Order', 'Нарачката')} ${orderNum} ${tr('has been cancelled. If you did not request this cancellation or have any questions, please contact us.', 'е откажана. Ако не сте го побарале тоа или имате прашања, контактирајте нè.')}
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
<html lang="${emailLang}">
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
                ${tr('ORDER', 'НАРАЧКА')} ${orderNumber}
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
                &copy; ${new Date().getFullYear()} DYSNOMIA Art Gallery. ${tr('All rights reserved.', 'Сите права се задржани.')}
              </p>
              <p style="margin: 0; font-family: Georgia, serif; font-size: 11px; color: #bbb;">
                ${tr('This email was sent regarding your order. Please do not reply to this email.', 'Оваа порака е испратена во врска со вашата нарачка. Ве молиме не одговарајте на неа.')}
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
  const html = wrapInLayout(bodyContent, escapeHtml(String(order.order_number)));
  return { subject, html };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order: clientOrder, emailType, trackingNumber } = await req.json();

    // Validate required fields
    if (!clientOrder || !emailType) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing order or emailType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validEmailTypes = ['order_placed', 'order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled'];
    if (!validEmailTypes.includes(emailType)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid emailType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin-only email types require authentication
    if (emailType !== 'order_placed') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the JWT and check admin role
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check admin role
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        return new Response(
          JSON.stringify({ success: false, error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Never trust the order sent by the browser — load it from the database by id.
    // Otherwise anyone could send branded emails with arbitrary content to any address.
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const orderId = typeof clientOrder.id === 'string' ? clientOrder.id : '';
    const { data: order } = await supabaseService
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The public 'order_placed' email may only be triggered right after checkout
    if (emailType === 'order_placed' && Date.now() - new Date(order.created_at).getTime() > 30 * 60 * 1000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order confirmation window expired' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    emailLang = order.language === 'en' ? 'en' : 'mk';
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
        bcc: [Deno.env.get('ADMIN_EMAIL') || 'contact_dysnomia@yahoo.com'],
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


