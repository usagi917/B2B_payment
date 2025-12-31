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
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/jpyc-logo.png"
                alt="JPYC logo"
                className="w-full h-full object-cover"
              />
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
