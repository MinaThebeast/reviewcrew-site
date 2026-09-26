// Free Review Gap Audit requests.
//
// Every valid request is written to the Vercel runtime logs (search "AUDIT_REQUEST").
// Optional delivery, configured with Vercel environment variables:
//   RESEND_API_KEY + AUDIT_TO_EMAIL  -> emails each request (AUDIT_FROM_EMAIL overrides the sender)
//   AUDIT_WEBHOOK_URL                -> POSTs the request as JSON (Zapier, Make, Slack workflow, CRM, ...)

const FIELDS = ["name", "business", "trade", "city", "gbp", "email", "phone"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (data.company_site) return json({ ok: true });

  const lead = {};
  for (const f of FIELDS) {
    const v = String(data[f] ?? "").trim().slice(0, 500);
    if (!v) return json({ error: `Missing ${f}` }, 400);
    lead[f] = v;
  }
  if (!EMAIL_RE.test(lead.email)) return json({ error: "Invalid email" }, 400);
  lead.plan = String(data.plan ?? "").trim().slice(0, 40) || null;
  lead.receivedAt = new Date().toISOString();

  console.log("AUDIT_REQUEST", JSON.stringify(lead));

  const deliveries = [];
  const { RESEND_API_KEY, AUDIT_TO_EMAIL, AUDIT_FROM_EMAIL, AUDIT_WEBHOOK_URL } = process.env;

  if (RESEND_API_KEY && AUDIT_TO_EMAIL) {
    const text = [
      `New Review Gap Audit request${lead.plan ? ` (interested in ${lead.plan})` : ""}`,
      "",
      `Name:      ${lead.name}`,
      `Business:  ${lead.business}`,
      `Trade:     ${lead.trade}`,
      `City:      ${lead.city}`,
      `Profile:   ${lead.gbp}`,
      `Email:     ${lead.email}`,
      `Phone:     ${lead.phone}`,
      `Received:  ${lead.receivedAt}`,
    ].join("\n");
    deliveries.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: AUDIT_FROM_EMAIL || "ReviewCrew <audits@getreviewcrew.com>",
          to: [AUDIT_TO_EMAIL],
          reply_to: lead.email,
          subject: `Audit request: ${lead.business} (${lead.city})`,
          text,
        }),
      }).then((r) => { if (!r.ok) throw new Error(`Resend ${r.status}`); })
    );
  }

  if (AUDIT_WEBHOOK_URL) {
    deliveries.push(
      fetch(AUDIT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      }).then((r) => { if (!r.ok) throw new Error(`Webhook ${r.status}`); })
    );
  }

  const results = await Promise.allSettled(deliveries);
  const failed = results.filter((r) => r.status === "rejected");
  failed.forEach((r) => console.error("AUDIT_DELIVERY_FAILED", r.reason?.message));

  // The lead is already in the logs; only fail the request if every configured delivery failed.
  if (deliveries.length && failed.length === deliveries.length) {
    return json({ error: "Delivery failed" }, 502);
  }
  return json({ ok: true });
}
