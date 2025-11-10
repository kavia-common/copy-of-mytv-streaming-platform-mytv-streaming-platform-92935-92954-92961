import React, { useMemo, useRef } from "react";
import NavBar from "../components/NavBar";
import { useAppSettings } from "../context/SettingsContext";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * Settings
 * Settings page allowing the user to change Language and Region.
 * - Accessible labels, keyboard navigation, and TV remote focusable areas.
 * - Persists via AppSettingsProvider (localStorage-backed).
 * - Dark Netflix-like theme with Tailwind.
 */
export default function Settings() {
  const { language, region, setLanguage, setRegion } = useAppSettings();

  // Example language and region options. Keep concise but representative.
  const languageOptions = useMemo(
    () => [
      { value: "en-US", label: "English (United States)" },
      { value: "en-GB", label: "English (United Kingdom)" },
      { value: "es-ES", label: "Español (España)" },
      { value: "es-MX", label: "Español (México)" },
      { value: "fr-FR", label: "Français (France)" },
      { value: "de-DE", label: "Deutsch (Deutschland)" },
      { value: "ja-JP", label: "日本語（日本）" },
      { value: "ko-KR", label: "한국어(대한민국)" },
    ],
    []
  );

  const regionOptions = useMemo(
    () => [
      { value: "US", label: "United States" },
      { value: "GB", label: "United Kingdom" },
      { value: "ES", label: "Spain" },
      { value: "MX", label: "Mexico" },
      { value: "FR", label: "France" },
      { value: "DE", label: "Germany" },
      { value: "JP", label: "Japan" },
      { value: "KR", label: "Korea" },
    ],
    []
  );

  const langSelectRef = useRef(null);
  const regSelectRef = useRef(null);

  // Focusable wrappers for TV remote navigation
  const { focusableProps: langFocus } = useFocusable({
    id: "settings-language",
    neighbors: { down: "settings-region" },
    onSelect: () => {
      langSelectRef.current?.focus?.();
    },
    defaultFocused: true,
  });
  const { focusableProps: regFocus } = useFocusable({
    id: "settings-region",
    neighbors: { up: "settings-language" },
    onSelect: () => {
      regSelectRef.current?.focus?.();
    },
  });

  return (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <NavBar />
      <main className="pt-16 md:pt-20 flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-5 md:px-6 lg:px-8">
          <header className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Settings</h1>
            <p className="mt-1 text-sm md:text-base text-gray-300">
              Adjust your language and region preferences. These settings are saved on this device.
            </p>
          </header>

          <section
            aria-label="Preferences"
            className="rounded-xl bg-[color:var(--ocean-surface)]/80 ring-1 ring-white/10 shadow-soft p-4 sm:p-6 space-y-5"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div {...langFocus} className="outline-none rounded-md">
                <label htmlFor="language" className="block text-sm text-gray-300 mb-1">
                  Language
                </label>
                <div className="relative">
                  <select
                    id="language"
                    ref={langSelectRef}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none rounded-md border border-white/10 bg-black/50 px-3 py-2 pr-8 text-gray-100 focus:border-blue-500 focus:outline-none"
                    aria-describedby="language-help"
                  >
                    {languageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-2.5 text-gray-400">▾</span>
                </div>
                <p id="language-help" className="mt-1 text-xs text-gray-400">
                  App text and formats may adapt to your selected language.
                </p>
              </div>

              <div {...regFocus} className="outline-none rounded-md">
                <label htmlFor="region" className="block text-sm text-gray-300 mb-1">
                  Region
                </label>
                <div className="relative">
                  <select
                    id="region"
                    ref={regSelectRef}
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full appearance-none rounded-md border border-white/10 bg-black/50 px-3 py-2 pr-8 text-gray-100 focus:border-blue-500 focus:outline-none"
                    aria-describedby="region-help"
                  >
                    {regionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-2.5 text-gray-400">▾</span>
                </div>
                <p id="region-help" className="mt-1 text-xs text-gray-400">
                  Regional content and formatting may be influenced by this setting.
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs text-gray-400">
              Tip: Use Arrow keys and Enter on a TV remote to focus and change options.
            </div>
          </section>
        </div>
      </main>
      {/* Footer intentionally excluded to keep logic unchanged (footer only on Home) */}
    </div>
  );
}
