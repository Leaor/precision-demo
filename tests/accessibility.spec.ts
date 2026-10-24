import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("desktop pages meet automated WCAG A and AA accessibility checks", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of [
    "/",
    "/contact/",
    "/services/interior-strip-outs/",
    "/about/",
    "/our-work/",
  ]) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, path).toEqual([]);
  }
});

test("mobile navigation and form errors meet automated accessibility checks", async ({
  page,
}) => {
  test.setTimeout(45_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const navigation = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(navigation.violations).toEqual([]);
  await page.getByRole("button", { name: "Close navigation" }).click();
  await page.getByRole("button", { name: "Prepare my enquiry" }).click();
  const validation = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(validation.violations).toEqual([]);
});
