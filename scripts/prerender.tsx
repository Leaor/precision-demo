import React from "react";
import { renderToString } from "react-dom/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import App, { getMeta, routes } from "../src/App";

const template = await readFile("dist/index.html", "utf8");
const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
if (siteUrl && !/^https:\/\/[^\s]+$/.test(siteUrl))
  throw new Error("SITE_URL must be a full HTTPS origin.");
for (const route of [...routes, "/404/"]) {
  const meta = getMeta(route);
  const canonical = siteUrl ? new URL(route, siteUrl).href : "";
  const head = `<meta property="og:type" content="website" /><meta property="og:locale" content="en_CA" /><meta property="og:site_name" content="Precision Demolition" /><meta property="og:title" content="${escape(meta.title)}" /><meta property="og:description" content="${escape(meta.description)}" /><meta name="twitter:card" content="summary_large_image" />${route === "/404/" ? '<meta name="robots" content="noindex" />' : ""}${canonical ? `<link rel="canonical" href="${escape(canonical)}" /><meta property="og:url" content="${escape(canonical)}" /><meta property="og:image" content="${escape(new URL("/images/interior-demolition.webp", siteUrl).href)}" />` : ""}`;
  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${escape(meta.title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escape(meta.description)}" />`,
    )
    .replace("<!--page-head-->", head)
    .replace("<!--app-html-->", renderToString(<App path={route} />));
  const file =
    route === "/404/"
      ? "dist/404.html"
      : path.join("dist", route, "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}
if (siteUrl) {
  const urls = routes
    .map(
      (route) =>
        `<url><loc>${escape(new URL(route, siteUrl).href)}</loc></url>`,
    )
    .join("");
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
  );
}
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${new URL("/sitemap.xml", siteUrl).href}\n` : ""}`,
);
console.log(
  `Prerendered ${routes.length} pages and a 404 page.${siteUrl ? " Sitemap and canonical URLs included." : " Set SITE_URL at build time to include canonical URLs and a sitemap."}`,
);
