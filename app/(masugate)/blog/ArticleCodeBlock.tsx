"use client";

import { useState } from "react";
import type { ArticleCodeBlock as ArticleCodeBlockData } from "../../data/articles";
import styles from "./blog.module.css";

type CopyState = "idle" | "copied" | "failed";

export function ArticleCodeBlock({
  block,
}: {
  block: ArticleCodeBlockData;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function copyCode() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(block.code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  const copyLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "failed"
        ? "Copy unavailable"
        : "Copy conceptual policy";

  return (
    <figure className={styles.codeFigure}>
      <figcaption>
        <span>{block.label}</span>
        <div className={styles.codeControls}>
          <b>{block.language}</b>
          <button onClick={copyCode} type="button">
            {copyLabel}
          </button>
        </div>
      </figcaption>
      <pre tabIndex={0}>
        <code>{block.code}</code>
      </pre>
      <div className={styles.codeContext}>
        <p>{block.note}</p>
        <a href={block.contextLink.href}>{block.contextLink.label}</a>
      </div>
    </figure>
  );
}
