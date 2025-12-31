"use client";

import { useI18n, type Locale } from "@/lib/i18n";

interface HeaderProps {
  onLocaleChange: (locale: Locale) => void;
}

export function Header({ onLocaleChange }: HeaderProps) {
  const { locale, t } = useI18n();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--color-text)]">
                {t("appTitle")}
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] hidden sm:block">
                {t("appSubtitle")}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center">
            <div className="flex items-center bg-[var(--color-surface-variant)] rounded-lg p-1">
              <button
                onClick={() => onLocaleChange("ja")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  locale === "ja"
                    ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                JP
              </button>
              <button
                onClick={() => onLocaleChange("en")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  locale === "en"
                    ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
