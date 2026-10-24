# Precision Demolition

A responsive website for residential, commercial and interior demolition enquiries in Toronto and the GTA. Built with React, TypeScript and Vite, with static HTML generated for the public pages and an Express server for production hosting and optional estimate delivery.

## Local development

Use Node.js 24 and npm. Install the locked dependencies from the repository root:

```sh
npm ci
npm run dev
```

Vite serves the development site on port **5173**. To exercise the estimate API during development, start the Express server in a second terminal:

```sh
npm start
```

The API runs on port **3000**; Vite proxies `/api` requests to it. Without an API connection or delivery configuration, the form supports preparing and downloading an enquiry without sending it.

## Build and run

```sh
npm run build
npm start
```

The build checks TypeScript, bundles the application and prerenders the public routes into `dist`. Express serves those files and the estimate API on port **3000**. The server also accepts `PORT` and `HOST` environment variables.

Set `SITE_URL` to the final HTTPS origin when creating a production build so canonical URLs and the sitemap use the correct domain. For example, with a domain you control:

```sh
SITE_URL=https://www.example.com npm run build
```

`npm run preview` provides Vite's static build preview; it does not replace the Express estimate API.

## Checks

```sh
npm run check
npm test
```

`check` runs TypeScript validation. `test` runs the Playwright checks configured in the repository. Browser checks require a compatible Chromium installation. These commands describe the available checks; consult their current output for results.

## Content and assets

- **`src/data/site.ts`** holds the service descriptions, FAQs, service areas, process steps, business contact fields and completed-project gallery. Keep offerings editable and confirm the final scope of each service with the business.
- **Contact information** is intentionally unset. Replace the `null` phone, email and address fields with verified information before launch. Do not substitute invented contact details.
- **Completed projects** belong in `projectGallery`, which is intentionally empty. No completed-project photographs were supplied. Add only photographs that are verified as Precision Demolition's work and approved for publication, together with accurate captions and alt text.
- **Illustrative photography** is AI-generated and labelled as illustrative on the website. It must not be described or displayed as completed Precision Demolition work. Preserve that distinction when editing layouts or content.
- **Logo:** the components use `/images/precision-logo.webp`. The current derivative was prepared from the inline reference image because the exact original attachment file was not accessible. Replace it with the original exported logo before launch to ensure exact proportions and lettering. Preserve its aspect ratio; never place it in a circular logo treatment, badge or container.
- **Fonts** are packaged locally through `@fontsource`: Barlow Semi Condensed for headings and Manrope for body text.

## Estimate form and delivery

The form collects a name, email address or phone number, project location, service, description, optional timeframe and contact consent. Client and server validation are implemented separately. The interface distinguishes prepared enquiries, active delivery, confirmed acceptance and failed or uncertain delivery.

Initially, the form is in **prepare-and-download mode**. Completing it does not send an enquiry. A downloaded text file is a local copy for the visitor; the interface does not report a successful submission when delivery is unavailable.

To enable delivery, configure these server-side environment variables through the hosting platform's secure configuration:

| Variable                 | Purpose                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `ESTIMATE_WEBHOOK_URL`   | An absolute HTTPS endpoint that accepts project enquiries as JSON. Setting this enables delivery. URLs with embedded credentials are rejected. |
| `ESTIMATE_WEBHOOK_TOKEN` | Optional credential sent to the endpoint as a Bearer token. Store it as a platform secret.                                                     |
| `PORT`                   | Optional server port; defaults to `3000`.                                                                                                      |
| `HOST`                   | Optional listening address; defaults to `0.0.0.0`.                                                                                             |

Do not put credentials in repository files, client-side environment variables or chat. Configure secrets through the hosting platform and restart the server after changing its environment.

The server posts the validated fields to the configured endpoint with an enquiry ID, source, submission timestamp and an `Idempotency-Key` header. The endpoint must return a successful HTTP status only after it has accepted the enquiry for reliable handling. The website reports acceptance only after receiving that successful response; this does not by itself prove that an email reached a person's inbox. Confirm the complete delivery workflow with the actual receiving system before opening online enquiries.

If the endpoint is missing, the API returns an explicit unavailable state. Invalid entries, rate limits, timeouts and upstream failures also return honest errors. Project details are kept in the browser form while the visitor reviews the result; the app does not implement a local enquiry database.

## Before public launch

1. Confirm the business's contact information, offered services and service-area availability.
2. Replace the derived logo with the original approved export and verify its proportions and lettering at desktop and mobile sizes.
3. Add approved, accurately described completed-project images with permission to publish them. Keep illustrative images clearly identified.
4. Connect the intended estimate receiving system, test a real end-to-end delivery with authorised test details, and verify failure handling.
5. Review the handling of enquiry data, privacy wording, consent and the receiving system's retention requirements.
6. Set the final `SITE_URL`, build again, and check page titles, descriptions, canonical URLs and the sitemap on the chosen host.
7. Run the checks and review all routes, navigation, mobile interactions and form states in the deployed environment.

No public deployment or external enquiry delivery is implied by the repository setup. Deployment, production contact information and connection to a real enquiry destination remain separate launch steps.
