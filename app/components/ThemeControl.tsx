"use client";

import { useEffect, useState } from "react";
import {
  isThemePreference,
  masugateThemeContract,
  resolveTheme,
  type MasuGateThemePreference,
} from "../data/theme";

const autoRefreshIntervalMs = 60_000;

function currentPreference(): MasuGateThemePreference {
  const rootPreference = document.documentElement.dataset
    .masugateThemePreference;

  if (isThemePreference(rootPreference)) return rootPreference;

  try {
    const storedPreference = window.localStorage.getItem(
      masugateThemeContract.storageKey,
    );
    return isThemePreference(storedPreference) ? storedPreference : "auto";
  } catch {
    return "auto";
  }
}

function applyTheme(
  preference: MasuGateThemePreference,
): void {
  const theme = resolveTheme(preference, new Date().getHours());
  const root = document.documentElement;
  root.dataset.masugateTheme = theme;
  root.dataset.masugateThemePreference = preference;
}

export function ThemeControl() {
  const [preference, setPreference] =
    useState<MasuGateThemePreference | null>(null);

  useEffect(() => {
    const initializationTimer = window.setTimeout(() => {
      setPreference(currentPreference());
    }, 0);

    return () => window.clearTimeout(initializationTimer);
  }, []);

  useEffect(() => {
    if (preference === null) return;

    try {
      window.localStorage.setItem(
        masugateThemeContract.storageKey,
        preference,
      );
    } catch {
      // The active choice still applies when storage is unavailable.
    }

    const syncTheme = () => applyTheme(preference);
    syncTheme();

    if (preference !== "auto") return;

    const timer = window.setInterval(syncTheme, autoRefreshIntervalMs);
    document.addEventListener("visibilitychange", syncTheme);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", syncTheme);
    };
  }, [preference]);

  return (
    <label className="masugate-theme-control">
      <span
        aria-hidden="true"
        className="masugate-theme-indicator"
      />
      <span className="masugate-theme-label">
        {masugateThemeContract.shortLabel}
      </span>
      <select
        aria-label={masugateThemeContract.controlLabel}
        onChange={(event) => {
          const nextPreference = event.currentTarget.value;
          if (isThemePreference(nextPreference)) {
            setPreference(nextPreference);
          }
        }}
        value={preference ?? "auto"}
      >
        {masugateThemeContract.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
