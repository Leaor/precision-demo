import { test, expect } from "@playwright/test";
import { routes } from "../src/App";

test("every page is prerendered with unique metadata and loads without runtime errors", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    expect(html, route).toContain("<h1");
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    titles.add(await page.title());
    descriptions.add(
      (await page
        .locator('meta[name="description"]')
        .getAttribute("content")) || "",
    );
    expect(await page.locator("img:not([alt])").count()).toBe(0);
  }
  expect(titles.size).toBe(routes.length);
  expect(descriptions.size).toBe(routes.length);
  expect(errors).toEqual([]);
});

test("all navigation destinations and homepage anchors work", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const destinations = await page
    .locator("a[href]")
    .evaluateAll((elements) => [
      ...new Set(elements.map((element) => element.getAttribute("href")!)),
    ]);
  for (const href of destinations) {
    if (href.startsWith("#")) {
      await expect(page.locator(href)).toHaveCount(1);
    } else if (href.startsWith("/")) {
      const response = await request.get(href.split("#")[0]);
      expect(response.status(), href).toBe(200);
      const hash = href.split("#")[1];
      if (hash) expect(await response.text(), href).toContain(`id="${hash}"`);
    }
  }
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Services", exact: true })
    .click();
  await expect(page).toHaveURL(/\/services\/$/);
  await page.locator(".service-card").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Interior strip-outs",
  );
});

test("mobile menu opens, closes with Escape, and navigates", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeHidden();
  await toggle.click();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeHidden();
  await toggle.click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Our Work" })
    .click();
  await expect(page).toHaveURL(/\/our-work\/$/);
  await expect(page.locator(".mobile-estimate")).toBeVisible();
});

test("pages fit small mobile, tablet and desktop without horizontal overflow", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/services/",
      "/services/residential-demolition/",
      "/about/",
      "/our-work/",
      "/contact/",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}`,
      ).toBe(true);
    }
  }
});

test("FAQs are keyboard accessible and expand meaningful answers", async ({
  page,
}) => {
  await page.goto("/");
  const faq = page.locator("details").first();
  await faq.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(faq).toHaveAttribute("open", "");
  await expect(faq.locator("p")).toBeVisible();
  expect((await faq.locator("p").textContent())?.length).toBeGreaterThan(40);
});

test("portfolio uses an honest empty state and images are labelled", async ({
  page,
}) => {
  await page.goto("/our-work/");
  await expect(
    page.getByText("Our project portfolio", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".project-grid")).toHaveCount(0);
  for (const caption of await page
    .locator("figure figcaption")
    .allTextContents())
    expect(caption.toLowerCase()).toContain("illustrative");
});

test("unknown paths return an accessible 404 with a working home link", async ({
  page,
}) => {
  const response = await page.goto("/this-page-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "solid ground",
  );
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("content and links remain available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/");
  await expect(
    page.getByRole("heading", { name: "Demolition. Done precisely." }),
  ).toBeVisible();
  await page.locator(".service-card").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Interior strip-outs",
  );
  await context.close();
});
