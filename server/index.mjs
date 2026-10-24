import express from "express";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const directory = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(directory, "../dist");
const app = express();
app.disable("x-powered-by");

const webhookValue = process.env.ESTIMATE_WEBHOOK_URL?.trim();
let webhook;
if (webhookValue) {
  try {
    webhook = new URL(webhookValue);
    if (webhook.protocol !== "https:" || webhook.username || webhook.password)
      throw new Error("Invalid webhook");
  } catch {
    console.error(
      "ESTIMATE_WEBHOOK_URL must be an absolute HTTPS URL without embedded credentials.",
    );
    process.exit(1);
  }
}

const serviceSlugs = new Set([
  "interior-strip-outs",
  "selective-demolition",
  "residential-demolition",
  "commercial-demolition",
  "concrete-removal",
  "debris-removal",
  "not-sure",
]);
const requestWindows = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestWindows)
    if (value.expires <= now) requestWindows.delete(key);
}, WINDOW_MS);
cleanup.unref();

app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});
app.use("/api", (request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  if (request.get("Sec-Fetch-Site") === "cross-site")
    return response
      .status(403)
      .json({ error: "This request must come from the website." });
  next();
});
app.get("/api/estimate/status", (_request, response) =>
  response.json({ enabled: Boolean(webhook) }),
);
app.post(
  "/api/estimate",
  express.json({ limit: "16kb", strict: true }),
  async (request, response) => {
    if (!request.is("application/json"))
      return response.status(415).json({ error: "Send the enquiry as JSON." });
    const now = Date.now();
    const key = request.ip || "unknown";
    let window = requestWindows.get(key);
    if (!window || window.expires <= now) {
      window = { count: 0, expires: now + WINDOW_MS };
      requestWindows.set(key, window);
    }
    window.count += 1;
    if (window.count > MAX_REQUESTS) {
      response.setHeader(
        "Retry-After",
        String(Math.ceil((window.expires - now) / 1000)),
      );
      return response
        .status(429)
        .json({ error: "Too many enquiries. Please try again later." });
    }
    const body = request.body;
    if (!body || Array.isArray(body) || typeof body !== "object")
      return response.status(400).json({ error: "Invalid enquiry." });
    if (typeof body.website === "string" && body.website.trim())
      return response
        .status(400)
        .json({ error: "Unable to accept this enquiry." });
    const fields = {};
    const errors = {};
    const limits = {
      name: 120,
      email: 254,
      phone: 40,
      location: 200,
      service: 100,
      description: 5000,
      timeline: 100,
    };
    for (const [field, limit] of Object.entries(limits)) {
      if (body[field] !== undefined && typeof body[field] !== "string")
        errors[field] = "Please enter valid text.";
      const value = typeof body[field] === "string" ? body[field].trim() : "";
      if (value.length > limit)
        errors[field] = `Please use no more than ${limit} characters.`;
      fields[field] = value;
    }
    if (!fields.name) errors.name = "Please enter your name.";
    if (!fields.email && !fields.phone)
      errors.email = "Please enter an email address or phone number.";
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      errors.email = "Please enter a valid email address.";
    if (fields.phone && fields.phone.replace(/\D/g, "").length < 10)
      errors.phone = "Please enter a phone number with at least 10 digits.";
    if (!fields.location)
      errors.location = "Please enter the project city or postal code.";
    if (!serviceSlugs.has(fields.service))
      errors.service = "Please choose a listed service.";
    if (!fields.description)
      errors.description = "Please describe your project.";
    if (body.consent !== true)
      errors.consent =
        "Please confirm that we may contact you about this enquiry.";
    if (Object.keys(errors).length)
      return response.status(400).json({ errors });
    if (!webhook)
      return response
        .status(503)
        .json({
          code: "DELIVERY_NOT_CONFIGURED",
          error: "Online enquiries are not open yet. Nothing has been sent.",
        });

    const enquiryId = randomUUID();
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Idempotency-Key": enquiryId,
    };
    if (process.env.ESTIMATE_WEBHOOK_TOKEN)
      headers.Authorization = `Bearer ${process.env.ESTIMATE_WEBHOOK_TOKEN}`;
    try {
      const upstream = await fetch(webhook, {
        method: "POST",
        headers,
        redirect: "error",
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          id: enquiryId,
          source: "precision-demolition-website",
          submittedAt: new Date().toISOString(),
          ...fields,
          consent: true,
        }),
      });
      await upstream.body?.cancel();
      if (!upstream.ok)
        return response
          .status(502)
          .json({
            error: "Delivery could not be confirmed. Please try again.",
          });
      return response.json({ accepted: true, reference: enquiryId });
    } catch {
      return response
        .status(502)
        .json({ error: "Delivery could not be confirmed. Please try again." });
    }
  },
);
app.use("/api", (_request, response) =>
  response.status(404).json({ error: "Endpoint not found." }),
);
app.use(
  express.static(dist, {
    index: "index.html",
    setHeaders(response, file) {
      response.setHeader(
        "Cache-Control",
        /\/assets\//.test(file)
          ? "public, max-age=31536000, immutable"
          : "public, max-age=0, must-revalidate",
      );
    },
  }),
);
app.use((_request, response) => {
  response.status(404);
  const notFound = path.join(dist, "404.html");
  if (existsSync(notFound)) return response.sendFile(notFound);
  return response
    .type("text/plain")
    .send("Page not found. Return to the homepage.");
});
app.use((error, _request, response, _next) => {
  if (error?.type === "entity.too.large")
    return response
      .status(413)
      .json({
        error: "This enquiry is too large. Please shorten your description.",
      });
  if (error instanceof SyntaxError)
    return response.status(400).json({ error: "Invalid enquiry data." });
  return response
    .status(500)
    .json({ error: "The request could not be completed." });
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const server = app.listen(port, host, () => {
  console.log(
    `Precision Demolition server listening on port ${port}. Estimate delivery ${webhook ? "enabled" : "disabled"}.`,
  );
});
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => server.close(() => process.exit(0)));
