export type MasuGateTheme = "light" | "dark";
export type MasuGateThemePreference = "auto" | MasuGateTheme;

export const masugateThemeContract = {
  storageKey: "masugate-theme-preference",
  lightStartsAtHour: 7,
  darkStartsAtHour: 19,
  controlLabel: "Color theme",
  shortLabel: "Theme",
  options: [
    { value: "auto", label: "Auto" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ],
} as const satisfies Readonly<{
  storageKey: string;
  lightStartsAtHour: number;
  darkStartsAtHour: number;
  controlLabel: string;
  shortLabel: string;
  options: readonly Readonly<{
    value: MasuGateThemePreference;
    label: string;
  }>[];
}>;

export function isThemePreference(
  value: string | null | undefined,
): value is MasuGateThemePreference {
  return value === "auto" || value === "light" || value === "dark";
}

export function themeForLocalHour(hour: number): MasuGateTheme {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error(`Invalid local hour: ${hour}`);
  }

  return hour >= masugateThemeContract.lightStartsAtHour &&
    hour < masugateThemeContract.darkStartsAtHour
    ? "light"
    : "dark";
}

export function resolveTheme(
  preference: MasuGateThemePreference,
  hour: number,
): MasuGateTheme {
  return preference === "auto" ? themeForLocalHour(hour) : preference;
}

export function createThemeBootScript(): string {
  const { darkStartsAtHour, lightStartsAtHour, storageKey } =
    masugateThemeContract;

  return `(function(){var d=document.documentElement,h=new Date().getHours(),p="auto";try{var s=localStorage.getItem(${JSON.stringify(storageKey)});if(s==="auto"||s==="light"||s==="dark")p=s;}catch(e){}var t=p==="auto"?(h>=${lightStartsAtHour}&&h<${darkStartsAtHour}?"light":"dark"):p;d.dataset.masugateTheme=t;d.dataset.masugateThemePreference=p;}());`;
}
