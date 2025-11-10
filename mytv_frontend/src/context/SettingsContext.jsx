import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * AppSettingsProvider
 * Global provider that stores Language and Region preferences, persists them to localStorage,
 * and exposes helpers for reading/updating them across the app.
 */
const SettingsContext = createContext(null);

const STORAGE_KEY = "mytv.settings.v1";
const DEFAULT_SETTINGS = {
  language: "en-US",
  region: "US",
};

// Safely load from localStorage
function loadSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      language: parsed?.language || DEFAULT_SETTINGS.language,
      region: parsed?.region || DEFAULT_SETTINGS.region,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Persist to localStorage
function persistSettings(settings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore write errors (e.g., private mode)
  }
}

// PUBLIC_INTERFACE
export function AppSettingsProvider({ children }) {
  /** Provide app-wide language and region with persistence. */
  const [language, setLanguage] = useState(DEFAULT_SETTINGS.language);
  const [region, setRegion] = useState(DEFAULT_SETTINGS.region);

  // Initialize from storage on mount
  useEffect(() => {
    const initial = loadSettings();
    setLanguage(initial.language);
    setRegion(initial.region);
  }, []);

  // Persist whenever values change
  useEffect(() => {
    persistSettings({ language, region });
  }, [language, region]);

  const updateLanguage = useCallback((lng) => setLanguage(lng), []);
  const updateRegion = useCallback((reg) => setRegion(reg), []);

  const value = useMemo(
    () => ({
      language,
      region,
      setLanguage: updateLanguage,
      setRegion: updateRegion,
    }),
    [language, region, updateLanguage, updateRegion]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAppSettings() {
  /** Hook to read language/region settings and their update functions. */
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return ctx;
}
