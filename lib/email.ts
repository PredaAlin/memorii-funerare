import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Eternal Memories <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const BASE_URL = process.env.NEXTAUTH_URL!

type OrderEmailData = {
  orderId: string
  customerName: string
  customerEmail: string
  deceasedName: string
  plan: string
  price: number
  shippingAddress: string
  shippingCity: string
  shippingPostalCode: string
  memorialId: string
  memorialUrl: string
}

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Georgia,serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#1c1917;padding:32px 40px;text-align:center">
      <p style="margin:0;color:#e7e5e4;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif">Eternal Memories</p>
    </div>
    <div style="padding:40px">
      ${content}
    </div>
    <div style="background:#f5f4f0;padding:20px 40px;text-align:center">
      <p style="margin:0;color:#a8a29e;font-size:11px;font-family:Arial,sans-serif">© ${new Date().getFullYear()} Eternal Memories Inc.</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendPaymentConfirmation(data: OrderEmailData) {
  const content = `
    <h1 style="margin:0 0 8px;font-size:26px;color:#1c1917">Order Confirmed</h1>
    <p style="margin:0 0 24px;color:#78716c;font-size:15px;font-family:Arial,sans-serif">Thank you, ${data.customerName}. Your memorial plate is being prepared.</p>

    <div style="background:#f5f4f0;border-radius:12px;padding:20px 24px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:13px;color:#a8a29e;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px">Memorial for</p>
      <p style="margin:0 0 16px;font-size:18px;color:#1c1917;font-weight:bold">${data.deceasedName}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#a8a29e;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px">Plan</p>
      <p style="margin:0 0 16px;font-size:15px;color:#1c1917;font-family:Arial,sans-serif">${data.plan === 'premium' ? 'Premium Legacy' : 'Basic Memorial'} — $${data.price.toFixed(2)}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#a8a29e;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px">Shipping to</p>
      <p style="margin:0;font-size:15px;color:#1c1917;font-family:Arial,sans-serif">${data.shippingAddress}, ${data.shippingCity}, ${data.shippingPostalCode}</p>
    </div>

    <p style="margin:0 0 16px;color:#57534e;font-size:14px;font-family:Arial,sans-serif">Your memorial page is now live. You can view and share it at any time:</p>
    <a href="${data.memorialUrl}" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:12px 28px;border-radius:100px;font-size:14px;font-family:Arial,sans-serif;font-weight:bold">View Memorial Page</a>

    <p style="margin:32px 0 0;color:#a8a29e;font-size:12px;font-family:Arial,sans-serif">Order #${data.orderId.slice(-8).toUpperCase()}</p>
  `
  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Your memorial order is confirmed — ${data.deceasedName}`,
    html: baseLayout(content),
  })
}

export async function sendAdminNewOrder(data: OrderEmailData) {
  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1c1917">New Order Received</h1>
    <p style="margin:0 0 24px;color:#78716c;font-size:14px;font-family:Arial,sans-serif">Order #${data.orderId.slice(-8).toUpperCase()} — $${data.price.toFixed(2)}</p>

    <div style="background:#f5f4f0;border-radius:12px;padding:20px 24px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-size:12px;color:#a8a29e;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px">Customer</p>
      <p style="margin:0 0 2px;font-size:15px;color:#1c1917;font-family:Arial,sans-serif">${data.customerName}</p>
      <p style="margin:0 0 16px;font-size:14px;color:#57534e;font-family:Arial,sans-serif">${data.customerEmail}</p>

      <p style="margin:0 0 4px;font-size:12px;color:#a8a29e;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px">Memorial</p>
      <p style="margin:0 0 2px;font-size:15px;color:#1c1917;font-family:Arial,sans-serif">${data.deceasedName}</p>
      <p style="margin:0 0 16px;font-size:14px;color:#57534e;font-family:Arial,sans-serif">${data.plan === 'premium' ? 'Premium Legacy' : 'Basic Memorial'}</p>

      <p style="margin:0 0 4px;font-size:12px;color:#a8a29e;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px">Ship to</p>
      <p style="margin:0;font-size:14px;color:#57534e;font-family:Arial,sans-serif">${data.shippingAddress}, ${data.shippingCity}, ${data.shippingPostalCode}</p>
    </div>

    <a href="${BASE_URL}/admin" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:12px 28px;border-radius:100px;font-size:14px;font-family:Arial,sans-serif;font-weight:bold">View in Admin</a>
  `
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New order: ${data.deceasedName} — $${data.price.toFixed(2)}`,
    html: baseLayout(content),
  })
}

export async function sendShippedNotification(data: OrderEmailData) {
  const content = `
    <h1 style="margin:0 0 8px;font-size:26px;color:#1c1917">Your Plate Has Been Shipped</h1>
    <p style="margin:0 0 24px;color:#78716c;font-size:15px;font-family:Arial,sans-serif">Great news, ${data.customerName}! Your memorial plate for <strong>${data.deceasedName}</strong> is on its way.</p>

    <div style="background:#f5f4f0;border-radius:12px;padding:20px 24px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:13px;color:#a8a29e;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px">Delivering to</p>
      <p style="margin:0;font-size:15px;color:#1c1917;font-family:Arial,sans-serif">${data.shippingAddress}, ${data.shippingCity}, ${data.shippingPostalCode}</p>
    </div>

    <p style="margin:0 0 16px;color:#57534e;font-size:14px;font-family:Arial,sans-serif">While you wait, your memorial page is live and ready to share:</p>
    <a href="${data.memorialUrl}" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:12px 28px;border-radius:100px;font-size:14px;font-family:Arial,sans-serif;font-weight:bold">View Memorial Page</a>

    <p style="margin:32px 0 0;color:#a8a29e;font-size:12px;font-family:Arial,sans-serif">Order #${data.orderId.slice(-8).toUpperCase()}</p>
  `
  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Your memorial plate is on its way — ${data.deceasedName}`,
    html: baseLayout(content),
  })
}
