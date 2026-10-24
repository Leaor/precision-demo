import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const enquiry = {
  name: "Website Test",
  email: "website-test@example.com",
  phone: "",
  location: "Toronto, M6H",
  service: "interior-strip-outs",
  description:
    "Planning an interior kitchen strip-out. Approximately 150 square feet, with ground-floor access.",
  timeline: "Within 1–3 months",
  consent: true,
  website: "",
};

async function fillEnquiry(page: Page, { phoneOnly = false } = {}) {
  const form = page.getByRole("form", { name: "Project estimate enquiry" });
  await form.getByLabel("Full name").fill(enquiry.name);
  if (phoneOnly) await form.getByLabel("Phone number").fill("416-555-0100");
  else await form.getByLabel("Email address").fill(enquiry.email);
  await form.getByLabel("Project location").fill(enquiry.location);
  await form.getByLabel("Service needed").selectOption(enquiry.service);
  await form.getByLabel("Ideal start date").selectOption(enquiry.timeline);
  await form.getByLabel("Tell us about your project").fill(enquiry.description);
  await form.getByRole("checkbox", { name: /I agree to be contacted/ }).check();
  return form;
}

test("offline enquiry validates, prepares and downloads without claiming delivery", async ({
  page,
}) => {
  let postCount = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/estimate") && request.method() === "POST")
      postCount += 1;
  });
  await page.goto("/contact/#estimate");
  const form = await fillEnquiry(page);
  await expect(
    form.getByText("Online enquiries are not open yet.", { exact: false }),
  ).toBeVisible();
  await form.getByRole("button", { name: "Prepare my enquiry" }).click();
  await expect(
    form.getByRole("heading", { name: "Your enquiry is ready to keep." }),
  ).toBeVisible();
  await expect(form.getByRole("status")).toContainText(
    "Nothing has been sent to Precision Demolition.",
  );
  await expect(form.getByRole("status")).toBeFocused();
  const downloading = page.waitForEvent("download");
  await form.getByRole("button", { name: "Download enquiry" }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("precision-demolition-enquiry.txt");
  const file = await download.path();
  expect(file).not.toBeNull();
  const contents = await readFile(file!, "utf8");
  expect(contents).toContain(
    "Draft only. This file has not been sent to Precision Demolition.",
  );
  expect(contents).toContain(enquiry.name);
  expect(contents).toContain(enquiry.email);
  expect(contents).toContain("Service: Interior strip-outs");
  expect(contents).toContain(enquiry.description);
  expect(postCount).toBe(0);
});

test("required validation identifies fields and focuses the first invalid input", async ({
  page,
}) => {
  await page.goto("/contact/#estimate");
  const form = page.getByRole("form", { name: "Project estimate enquiry" });
  await form.getByRole("button", { name: "Prepare my enquiry" }).click();
  const name = form.getByLabel("Full name");
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAccessibleDescription("Please enter your name.");
  await expect(form.getByLabel("Email address")).toHaveAccessibleDescription(
    "Enter an email address or phone number so we can reach you.",
  );
  await expect(form.getByLabel("Project location")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(form.getByLabel("Service needed")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(form.getByLabel("Tell us about your project")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(form.getByRole("checkbox")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(
    form.getByRole("heading", { name: "Your enquiry is ready to keep." }),
  ).toHaveCount(0);
});

test("service links preselect the service on the contact form", async ({
  page,
}) => {
  await page.goto("/contact/?service=interior-strip-outs#estimate");
  await expect(page.getByLabel("Service needed")).toHaveValue(
    "interior-strip-outs",
  );
});

test("malformed email is rejected and focused", async ({ page }) => {
  await page.goto("/contact/#estimate");
  const form = await fillEnquiry(page);
  await form.getByLabel("Email address").fill("not-an-email");
  await form.getByRole("button", { name: "Prepare my enquiry" }).click();
  await expect(form.getByLabel("Email address")).toBeFocused();
  await expect(form.getByLabel("Email address")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(form.getByLabel("Email address")).toHaveAccessibleDescription(
    "Please enter a valid email address.",
  );
});

test("a phone number can be used without an email address", async ({
  page,
}) => {
  await page.goto("/contact/#estimate");
  const form = await fillEnquiry(page, { phoneOnly: true });
  await form.getByRole("button", { name: "Prepare my enquiry" }).click();
  await expect(
    form.getByRole("heading", { name: "Your enquiry is ready to keep." }),
  ).toBeVisible();
  await expect(form.getByLabel("Email address")).toHaveAttribute(
    "aria-invalid",
    "false",
  );
});

test("enabled delivery shows pending state, then confirmed success", async ({
  page,
}) => {
  await page.route("**/api/estimate/status", (route) =>
    route.fulfill({ json: { enabled: true } }),
  );
  let releaseResponse!: () => void;
  const waiting = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });
  let submitted: unknown;
  await page.route("**/api/estimate", async (route) => {
    submitted = route.request().postDataJSON();
    await waiting;
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({
      json: { accepted: true, reference: "test-enquiry-reference" },
    });
  });
  await page.goto("/contact/#estimate");
  const form = await fillEnquiry(page);
  await form.getByRole("button", { name: "Request an estimate" }).click();
  try {
    await expect(
      form.getByRole("button", { name: "Sending your enquiry…" }),
    ).toBeDisabled();
    await expect(form.getByRole("status")).toContainText(
      "Sending your project details.",
    );
    await expect(form.getByLabel("Full name")).toBeDisabled();
    await expect(
      form.getByRole("heading", { name: "Your enquiry has been sent." }),
    ).toHaveCount(0);
  } finally {
    releaseResponse();
  }
  await expect(
    form.getByRole("heading", { name: "Your enquiry has been sent." }),
  ).toBeVisible();
  await expect(form.getByRole("status")).toBeFocused();
  await expect(
    form.getByRole("button", { name: "Enquiry sent", exact: true }),
  ).toBeDisabled();
  expect(submitted).toMatchObject(enquiry);
});

test("failed delivery preserves entries and allows a successful retry", async ({
  page,
}) => {
  await page.route("**/api/estimate/status", (route) =>
    route.fulfill({ json: { enabled: true } }),
  );
  let attempts = 0;
  await page.route("**/api/estimate", (route) => {
    attempts += 1;
    return attempts === 1
      ? route.fulfill({
          status: 502,
          json: { error: "Delivery could not be confirmed." },
        })
      : route.fulfill({
          json: { accepted: true, reference: "retry-test-reference" },
        });
  });
  await page.goto("/contact/#estimate");
  const form = await fillEnquiry(page);
  await form.getByRole("button", { name: "Request an estimate" }).click();
  await expect(form.getByRole("alert")).toContainText(
    "We could not confirm delivery of your enquiry.",
  );
  await expect(form.getByRole("alert")).toBeFocused();
  await expect(form.getByLabel("Full name")).toHaveValue(enquiry.name);
  await expect(form.getByLabel("Email address")).toHaveValue(enquiry.email);
  await expect(form.getByLabel("Tell us about your project")).toHaveValue(
    enquiry.description,
  );
  await expect(form.getByRole("checkbox")).toBeChecked();
  await expect(
    form.getByRole("button", { name: "Download enquiry" }),
  ).toBeVisible();
  await form.getByRole("button", { name: "Request an estimate" }).click();
  await expect(
    form.getByRole("heading", { name: "Your enquiry has been sent." }),
  ).toBeVisible();
  expect(attempts).toBe(2);
});

test("production API reports disabled delivery and never accepts an undelivered enquiry", async ({
  request,
}) => {
  const status = await request.get("/api/estimate/status");
  expect(status.status()).toBe(200);
  expect(status.headers()["cache-control"]).toBe("no-store");
  expect(await status.json()).toEqual({ enabled: false });
  const response = await request.post("/api/estimate", { data: enquiry });
  expect(response.status()).toBe(503);
  expect(await response.json()).toMatchObject({
    code: "DELIVERY_NOT_CONFIGURED",
  });
});

test("production API validates contact, scope and consent independently of the browser", async ({
  request,
}) => {
  const response = await request.post("/api/estimate", {
    data: {
      name: "API Test",
      email: "invalid-email",
      service: "unknown-service",
      consent: false,
    },
  });
  expect(response.status()).toBe(400);
  const result = await response.json();
  expect(Object.keys(result.errors)).toEqual(
    expect.arrayContaining([
      "email",
      "location",
      "service",
      "description",
      "consent",
    ]),
  );
  expect(result.accepted).toBeUndefined();
  const malformed = await request.post("/api/estimate", {
    headers: { "Content-Type": "application/json" },
    data: '{"name":',
  });
  expect(malformed.status()).toBe(400);
  expect(await malformed.json()).toHaveProperty(
    "error",
    "Invalid enquiry data.",
  );
});
