"use client";

import type { FormEvent } from "react";
import styles from "./CustomizedDemoRequestForm.module.css";

interface CustomizedDemoRequestFormProps {
  actionLabel: string;
  recipientEmail: string;
  recipientMailtoHref: `mailto:${string}`;
}

function formValue(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "").trim();
}

export function CustomizedDemoRequestForm({
  actionLabel,
  recipientEmail,
  recipientMailtoHref,
}: CustomizedDemoRequestFormProps) {
  function openEmailDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formValue(formData, "name");
    const replyEmail = formValue(formData, "replyEmail");
    const organization = formValue(formData, "organization");
    const scenario = formValue(formData, "scenario");
    const subjectContext = organization || name || "Agent governance scenario";
    const subject = `Customized MasuGate demo request — ${subjectContext}`;
    const body = [
      "Hello MasuGate team,",
      "",
      "I would like to request a customized demo.",
      "",
      `Name: ${name}`,
      `Reply email: ${replyEmail}`,
      `Organization or project: ${organization || "Not specified"}`,
      "",
      "Scenario and governance need:",
      scenario,
      "",
      "Thank you.",
    ].join("\n");

    window.location.href = `${recipientMailtoHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form
      aria-describedby="demo-request-delivery-note"
      className={styles.form}
      onSubmit={openEmailDraft}
    >
      <div className={styles.heading}>
        <span>Customized walkthrough</span>
        <h3>{actionLabel}</h3>
        <p>
          Tell us the agent system and governance question you want to explore.
          We will use it to scope the conversation.
        </p>
      </div>

      <div className={styles.fieldGrid}>
        <label>
          <span>Name</span>
          <input
            autoComplete="name"
            maxLength={100}
            name="name"
            required
            type="text"
          />
        </label>
        <label>
          <span>Reply email</span>
          <input
            autoComplete="email"
            maxLength={160}
            name="replyEmail"
            required
            type="email"
          />
        </label>
      </div>

      <label>
        <span>Organization or project <small>Optional</small></span>
        <input
          autoComplete="organization"
          maxLength={160}
          name="organization"
          type="text"
        />
      </label>

      <label>
        <span>What should the customized demo cover?</span>
        <textarea
          maxLength={2000}
          minLength={20}
          name="scenario"
          placeholder="For example: the agent framework, consequential action, first governance rule, and state that may change concurrently."
          required
          rows={6}
        />
      </label>

      <noscript>
        <style>{`.${styles.submitButton} { display: none !important; }`}</style>
        <p className={styles.noScript}>
          This draft composer requires JavaScript. Copy {recipientEmail} into
          your preferred email or webmail service instead; nothing has been
          sent from this page.
        </p>
      </noscript>

      <div className={styles.actions}>
        <button
          className={`masugate-button masugate-button-primary ${styles.submitButton}`}
          type="submit"
        >
          Open email draft
        </button>
        <p id="demo-request-delivery-note">
          This opens your email app with a prepared message to {recipientEmail}.
          Review it and press Send there; this website does not transmit or
          store the form.
        </p>
      </div>

      <p className={styles.fallback}>
        Prefer webmail? Copy <strong>{recipientEmail}</strong> into a new
        message.
      </p>
    </form>
  );
}
