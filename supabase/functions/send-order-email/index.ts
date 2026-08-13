// Ibibondo — order notification emails via Resend.
//
// Deploy: supabase functions deploy send-order-email
// Secret:  supabase secrets set RESEND_API_KEY=...  (Dashboard → Edge Functions
//          → Secrets works too, no CLI required)
//
// Called from the frontend right after an order is created or its status
// changes — see src/lib/supabase/notify.ts. Best-effort: the calling code
// never lets a failure here block checkout or an admin status update, an
// email is a side effect, not the transaction.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_ADDRESS = Deno.env.get('ORDER_EMAIL_FROM') ?? 'Ibibondo <onboarding@resend.dev>';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type EmailType = 'order_created' | 'order_shipped' | 'order_delivered' | 'order_cancelled';

interface LineItem {
  name: string;
  variantLabel?: string | null;
  quantity: number;
  priceRwf: number;
}

interface OrderPayload {
  reference: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  address: string;
  deliveryZoneName: string;
  paymentMethod: string;
  /** Self-reported by the customer for `momo` orders — no gateway, so staff
   * cross-check these against the real merchant account before releasing. */
  payerName: string | null;
  paidAmountRwf: number | null;
  subtotalRwf: number;
  deliveryRwf: number;
  totalRwf: number;
  createdAt: string;
}

interface RequestBody {
  type: EmailType;
  order: OrderPayload;
  lineItems: LineItem[];
  /** Only used for `order_created` — the storefront's current contact email
   * from Settings, passed in rather than looked up here so a contact-email
   * change takes effect without redeploying this function. */
  adminEmail?: string;
}

function rwf(amount: number): string {
  return `${Math.round(amount).toLocaleString('en-US')} RWF`;
}

function lineItemsTable(items: LineItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#2E3A59;">
          ${item.name}${item.variantLabel ? ` <span style="color:#8a8f9c;">· ${item.variantLabel}</span>` : ''}
          <br /><span style="color:#8a8f9c;font-size:12px;">Qty ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#2E3A59;text-align:right;white-space:nowrap;">
          ${rwf(item.priceRwf * item.quantity)}
        </td>
      </tr>`,
    )
    .join('');
  return `<table style="width:100%;border-collapse:collapse;margin-top:12px;">${rows}</table>`;
}

function shell(preheader: string, title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F7F3EE;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none;font-size:1px;color:#F7F3EE;">${preheader}</span>
    <table style="width:100%;background:#F7F3EE;padding:32px 16px;">
      <tr><td>
        <table style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">
          <tr><td style="background:#F2C7CE;padding:20px 28px;">
            <span style="font-size:16px;font-weight:700;color:#2E3A59;">Ibibondo</span>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="margin:0 0 12px;font-size:20px;color:#2E3A59;">${title}</h1>
            ${bodyHtml}
          </td></tr>
          <tr><td style="padding:20px 28px;background:#FAF7F3;text-align:center;">
            <span style="font-size:12px;color:#8a8f9c;">Ibibondo — Comfort &amp; Care for babies in Kigali</span>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function orderSummaryBlock(order: OrderPayload, items: LineItem[]): string {
  return `
    <p style="margin:0 0 4px;font-size:14px;color:#2E3A59;">Order <strong>${order.reference}</strong></p>
    ${lineItemsTable(items)}
    <table style="width:100%;margin-top:12px;font-size:14px;color:#2E3A59;">
      <tr><td style="padding:3px 0;color:#8a8f9c;">Subtotal</td><td style="padding:3px 0;text-align:right;">${rwf(order.subtotalRwf)}</td></tr>
      <tr><td style="padding:3px 0;color:#8a8f9c;">Delivery (${order.deliveryZoneName})</td><td style="padding:3px 0;text-align:right;">${rwf(order.deliveryRwf)}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Total</td><td style="padding:6px 0;text-align:right;font-weight:700;">${rwf(order.totalRwf)}</td></tr>
    </table>`;
}

function customerConfirmationEmail(order: OrderPayload, items: LineItem[]): { subject: string; html: string } {
  const body = `
    <p style="margin:0 0 16px;font-size:14px;color:#2E3A59;">Thanks, ${order.customerName.split(' ')[0]} — we've got your order and we're getting it ready.</p>
    ${orderSummaryBlock(order, items)}
    <p style="margin:20px 0 0;font-size:13px;color:#8a8f9c;">
      Delivering to ${order.address}, ${order.deliveryZoneName}. We'll be in touch on ${order.customerPhone} — check the item at the door and hand it straight back to the rider if anything's not right, no need to arrange a separate return.
    </p>`;
  return { subject: `Order confirmed — ${order.reference}`, html: shell('Your Ibibondo order is confirmed', 'Order confirmed', body) };
}

function paymentLine(order: OrderPayload): string {
  if (order.paymentMethod === 'momo') {
    const reported =
      order.payerName || order.paidAmountRwf != null
        ? ` — reported by ${order.payerName ?? 'unknown'}${order.paidAmountRwf != null ? `, ${rwf(order.paidAmountRwf)}` : ''} (self-reported, verify against the merchant account before releasing)`
        : '';
    return `Paid via MoMo${reported}.`;
  }
  if (order.paymentMethod === 'pay_on_delivery') {
    const reported =
      order.payerName || order.paidAmountRwf != null
        ? ` — commitment fee reported by ${order.payerName ?? 'unknown'}${order.paidAmountRwf != null ? `, ${rwf(order.paidAmountRwf)}` : ''} (self-reported, verify against the merchant account before releasing)`
        : '';
    const remaining =
      order.paidAmountRwf != null ? Math.max(0, order.totalRwf - order.paidAmountRwf) : null;
    return `Pay on delivery${reported}.${remaining != null ? ` Collect the remaining ${rwf(remaining)} cash on arrival.` : ''}`;
  }
  return `Paid via ${order.paymentMethod}.`;
}

function adminNotificationEmail(order: OrderPayload, items: LineItem[]): { subject: string; html: string } {
  const body = `
    <p style="margin:0 0 16px;font-size:14px;color:#2E3A59;">New order from <strong>${order.customerName}</strong> (${order.customerPhone}${order.customerEmail ? `, ${order.customerEmail}` : ''}).</p>
    ${orderSummaryBlock(order, items)}
    <p style="margin:20px 0 0;font-size:13px;color:#8a8f9c;">Delivering to ${order.address}, ${order.deliveryZoneName}. ${paymentLine(order)}</p>`;
  return { subject: `New order — ${order.reference}`, html: shell('New Ibibondo order', 'New order placed', body) };
}

function statusEmail(
  type: 'order_shipped' | 'order_delivered' | 'order_cancelled',
  order: OrderPayload,
  items: LineItem[],
): { subject: string; html: string } {
  const copy: Record<typeof type, { title: string; line: string }> = {
    order_shipped: {
      title: 'Your order is on its way',
      line: `${order.customerName.split(' ')[0]}, your order is on its way to ${order.address}, ${order.deliveryZoneName}.`,
    },
    order_delivered: {
      title: 'Delivered!',
      line: `Your order has been delivered. Thanks for shopping with Ibibondo, ${order.customerName.split(' ')[0]}.`,
    },
    order_cancelled: {
      title: 'Your order was cancelled',
      line: `Order ${order.reference} has been cancelled. If you already paid, your refund is on its way back to the same payment method — message us on WhatsApp if you have any questions.`,
    },
  };
  const { title, line } = copy[type];
  const body = `<p style="margin:0 0 16px;font-size:14px;color:#2E3A59;">${line}</p>${orderSummaryBlock(order, items)}`;
  return { subject: `${title} — ${order.reference}`, html: shell(title, title, body) };
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not set' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, order, lineItems, adminEmail } = (await req.json()) as RequestBody;
    const sent: string[] = [];

    if (type === 'order_created') {
      const admin = adminNotificationEmail(order, lineItems);
      if (adminEmail) {
        await sendEmail(adminEmail, admin.subject, admin.html);
        sent.push('admin');
      }
      if (order.customerEmail) {
        const customer = customerConfirmationEmail(order, lineItems);
        await sendEmail(order.customerEmail, customer.subject, customer.html);
        sent.push('customer');
      }
    } else if (order.customerEmail) {
      const { subject, html } = statusEmail(type, order, lineItems);
      await sendEmail(order.customerEmail, subject, html);
      sent.push('customer');
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
