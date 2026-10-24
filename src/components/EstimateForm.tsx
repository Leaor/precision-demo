import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { services } from "../data/site";

type Fields = {
  name: string;
  email: string;
  phone: string;
  location: string;
  service: string;
  description: string;
  timeline: string;
  consent: boolean;
  website: string;
};
type Errors = Partial<Record<keyof Fields, string>>;
type Outcome = "idle" | "prepared" | "sending" | "sent" | "error";

export default function EstimateForm({ service = "" }: { service?: string }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    phone: "",
    location: "",
    service,
    description: "",
    timeline: "",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [delivery, setDelivery] = useState<"checking" | "enabled" | "disabled">(
    "checking",
  );
  const [outcome, setOutcome] = useState<Outcome>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    fetch("/api/estimate/status", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        setDelivery(data.enabled === true ? "enabled" : "disabled");
      })
      .catch(() => setDelivery("disabled"))
      .finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (service) setFields((current) => ({ ...current, service }));
  }, [service]);

  useEffect(() => {
    if (outcome === "prepared" || outcome === "sent" || outcome === "error")
      statusRef.current?.focus();
  }, [outcome]);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      if (key === "email" || key === "phone") {
        delete next.email;
        delete next.phone;
      }
      return next;
    });
    if (outcome !== "sending") setOutcome("idle");
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!fields.name.trim()) next.name = "Please enter your name.";
    if (!fields.email.trim() && !fields.phone.trim())
      next.email =
        "Enter an email address or phone number so we can reach you.";
    if (
      fields.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())
    )
      next.email = "Please enter a valid email address.";
    if (fields.phone.trim() && fields.phone.replace(/\D/g, "").length < 10)
      next.phone = "Please enter a phone number with at least 10 digits.";
    if (!fields.location.trim())
      next.location = "Please enter the project city or postal code.";
    if (
      !services.some((item) => item.slug === fields.service) &&
      fields.service !== "not-sure"
    )
      next.service = "Please choose a service, or select “Not sure yet”.";
    if (!fields.description.trim())
      next.description = "Please tell us a little about your project.";
    if (!fields.consent)
      next.consent =
        "Please confirm that we may contact you about this enquiry.";
    return next;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (outcome === "sending" || delivery === "checking") return;
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      setOutcome("idle");
      const first = Object.keys(next)[0];
      (
        formRef.current?.elements.namedItem(first) as HTMLElement | null
      )?.focus();
      return;
    }
    if (delivery !== "enabled") {
      setOutcome("prepared");
      return;
    }
    setOutcome("sending");
    setMessage("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(fields),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.accepted !== true) {
        if (
          response.status === 503 &&
          data.code === "DELIVERY_NOT_CONFIGURED"
        ) {
          setDelivery("disabled");
          setOutcome("prepared");
          return;
        }
        if (
          response.status === 400 &&
          data.errors &&
          typeof data.errors === "object"
        )
          setErrors(data.errors);
        throw new Error(
          response.status === 429
            ? "There have been several requests from this connection. Please wait a few minutes, or download your enquiry to keep it."
            : "We could not confirm delivery of your enquiry. Your details are still here. Please try again or download a copy.",
        );
      }
      setOutcome("sent");
    } catch (error) {
      setMessage(
        error instanceof Error && error.name !== "AbortError"
          ? error.message
          : "We could not confirm delivery of your enquiry. Your details are still here. Please try again or download a copy.",
      );
      setOutcome("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function download() {
    const serviceTitle =
      services.find((item) => item.slug === fields.service)?.title ??
      "Not sure yet";
    const text = [
      "PRECISION DEMOLITION — PROJECT ENQUIRY",
      outcome === "sent"
        ? "A copy of your submitted enquiry."
        : "Draft only. This file has not been sent to Precision Demolition.",
      "",
      `Name: ${fields.name.trim()}`,
      `Email: ${fields.email.trim() || "Not provided"}`,
      `Phone: ${fields.phone.trim() || "Not provided"}`,
      `Project location: ${fields.location.trim()}`,
      `Service: ${serviceTitle}`,
      `Preferred timing: ${fields.timeline || "Flexible / not sure"}`,
      "",
      "Project description:",
      fields.description.trim(),
      "",
      "Permission to contact about this enquiry: Yes",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "precision-demolition-enquiry.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function inputProps(key: keyof Fields) {
    return {
      id: `${id}-${key}`,
      name: key,
      "aria-invalid": Boolean(errors[key]),
      "aria-describedby": errors[key]
        ? `${id}-${key}-error`
        : key === "email" || key === "phone"
          ? `${id}-contact-help`
          : undefined,
      disabled: outcome === "sending",
    };
  }
  function error(key: keyof Fields) {
    return errors[key] ? (
      <span className="field-error" id={`${id}-${key}-error`}>
        {errors[key]}
      </span>
    ) : null;
  }

  return (
    <form
      className="estimate-form"
      ref={formRef}
      onSubmit={submit}
      noValidate
      aria-label="Project estimate enquiry"
    >
      <p className="form-intro">
        A few details help us understand the job. Fields marked{" "}
        <span aria-hidden="true">*</span> are required.
      </p>
      <div className="form-grid">
        <div className="form-field full-width">
          <label htmlFor={`${id}-name`}>
            Full name <span aria-hidden="true">*</span>
          </label>
          <input
            {...inputProps("name")}
            autoComplete="name"
            required
            maxLength={120}
            placeholder="Your name"
            value={fields.name}
            onChange={(event) => update("name", event.target.value)}
          />
          {error("name")}
        </div>
        <p className="form-field-help full-width" id={`${id}-contact-help`}>
          Please provide an email address or phone number.
        </p>
        <div className="form-field">
          <label htmlFor={`${id}-email`}>Email address</label>
          <input
            {...inputProps("email")}
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
            value={fields.email}
            onChange={(event) => update("email", event.target.value)}
          />
          {error("email")}
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-phone`}>Phone number</label>
          <input
            {...inputProps("phone")}
            type="tel"
            autoComplete="tel"
            maxLength={40}
            placeholder="(416) 000-0000"
            value={fields.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
          {error("phone")}
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-location`}>
            Project location <span aria-hidden="true">*</span>
          </label>
          <input
            {...inputProps("location")}
            autoComplete="address-level2"
            required
            maxLength={200}
            placeholder="City or postal code"
            value={fields.location}
            onChange={(event) => update("location", event.target.value)}
          />
          {error("location")}
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-service`}>
            Service needed <span aria-hidden="true">*</span>
          </label>
          <select
            {...inputProps("service")}
            required
            value={fields.service}
            onChange={(event) => update("service", event.target.value)}
          >
            <option value="">Select a service</option>
            {services.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
            <option value="not-sure">Not sure yet</option>
          </select>
          {error("service")}
        </div>
        <div className="form-field full-width">
          <label htmlFor={`${id}-timeline`}>
            Ideal start date <span className="optional">(optional)</span>
          </label>
          <select
            {...inputProps("timeline")}
            value={fields.timeline}
            onChange={(event) => update("timeline", event.target.value)}
          >
            <option value="">Select a timeframe</option>
            <option>As soon as possible</option>
            <option>Within 1 month</option>
            <option>Within 1–3 months</option>
            <option>More than 3 months away</option>
            <option>Flexible / just planning</option>
          </select>
        </div>
        <div className="form-field full-width">
          <label htmlFor={`${id}-description`}>
            Tell us about your project <span aria-hidden="true">*</span>
          </label>
          <textarea
            {...inputProps("description")}
            required
            rows={5}
            maxLength={5000}
            placeholder="What needs to be removed? Include the approximate size, property type and any access considerations."
            value={fields.description}
            onChange={(event) => update("description", event.target.value)}
          />
          {error("description")}
        </div>
        <div
          className="form-honeypot"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <label htmlFor={`${id}-website`}>Leave this field empty</label>
          <input
            id={`${id}-website`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={fields.website}
            onChange={(event) => update("website", event.target.value)}
          />
        </div>
        <div className="form-field full-width">
          <label className="checkbox-label" htmlFor={`${id}-consent`}>
            <input
              {...inputProps("consent")}
              type="checkbox"
              required
              checked={fields.consent}
              onChange={(event) => update("consent", event.target.checked)}
            />
            <span>
              I agree to be contacted about this project enquiry.{" "}
              <span aria-hidden="true">*</span>
            </span>
          </label>
          {error("consent")}
        </div>
      </div>
      {delivery === "disabled" && (
        <p className="form-notice">
          Online enquiries are not open yet. You can prepare and download your
          project details here; nothing will be sent.
        </p>
      )}
      {delivery === "enabled" && (
        <p className="form-privacy-note">
          Your details will be sent to Precision Demolition to respond to this
          project enquiry. Please do not include sensitive personal information.
        </p>
      )}
      <button
        className="button button-red form-submit"
        type="submit"
        disabled={
          outcome === "sending" || delivery === "checking" || outcome === "sent"
        }
      >
        {outcome === "sending"
          ? "Sending your enquiry…"
          : outcome === "sent"
            ? "Enquiry sent"
            : delivery === "checking"
              ? "Checking availability…"
              : delivery === "enabled"
                ? "Request an estimate"
                : "Prepare my enquiry"}
        <span aria-hidden="true">↗</span>
      </button>
      {outcome === "sending" && (
        <p role="status" className="form-progress">
          Sending your project details. Please keep this page open.
        </p>
      )}
      {(outcome === "prepared" ||
        outcome === "sent" ||
        outcome === "error") && (
        <div
          className={`form-status form-status-${outcome}`}
          role={outcome === "error" ? "alert" : "status"}
          tabIndex={-1}
          ref={statusRef}
        >
          <h3>
            {outcome === "prepared"
              ? "Your enquiry is ready to keep."
              : outcome === "sent"
                ? "Your enquiry has been sent."
                : "We couldn’t confirm delivery."}
          </h3>
          <p>
            {outcome === "prepared"
              ? "Nothing has been sent to Precision Demolition. Download a copy of your project details to keep for when direct contact becomes available."
              : outcome === "sent"
                ? "Thank you for sharing your project details. Keep a copy for your records. An enquiry is not a confirmed booking or estimate."
                : message}
          </p>
          <button
            type="button"
            className="button button-outline"
            onClick={download}
          >
            Download enquiry <span aria-hidden="true">↓</span>
          </button>
        </div>
      )}
      <noscript>
        <p className="form-notice">
          JavaScript is needed to prepare or send this form. Direct contact
          details will be added when confirmed.
        </p>
      </noscript>
    </form>
  );
}
