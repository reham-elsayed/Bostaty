"use client";

import { useInsertionEffect } from "react";
import { useTenant } from "@/providers/TenantProvider";
import { THEME_REGISTRY } from "@/config/themes";

export function ThemeInjector() {
  const { settings } = useTenant();
  const activeTheme = THEME_REGISTRY.find(t => t.id === settings?.theme) || THEME_REGISTRY[0];

  const generateCss = (tokens: Record<string, string>) =>
    Object.entries(tokens).map(([key, val]) => `${key}: ${val};`).join(" ");

  const css = `
    :root {
      ${generateCss(activeTheme.tokens.light)}
      --radius: ${settings?.radius || '0.5rem'};
    }
    .dark {
      ${generateCss(activeTheme.tokens.dark)}
    }
  `;

  useInsertionEffect(() => {
    const style = document.getElementById("tenant-theme-overrides") || document.createElement("style");
    style.id = "tenant-theme-overrides";
    style.innerHTML = css;
    if (!document.head.contains(style)) {
      document.head.appendChild(style);
    }
  }, [css]);

  return null;
}