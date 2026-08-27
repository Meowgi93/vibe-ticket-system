import { Link } from "react-router-dom";
import ConcertCard from "./ConcertCard";
import { useTranslation } from "react-i18next";

export default function ConcertGrid({ concerts, showViewAll = true }) {
  const { t } = useTranslation();

  return (
    <section id="concerts" className="relative scroll-mt-20 pt-10 pb-10 sm:pt-14 sm:pb-12">
      {/* Subtle gradient line */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Heading ── */}
        <div className="mb-14 text-left">

          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            {t("grid_title_1")} <span className="text-gradient-blue-lime">{t("grid_title_2")}</span>
          </h2>
          <p className="mt-4 max-w-xl text-gray-500 sm:text-lg">
            {t("grid_desc")}
          </p>
        </div>

        {/* ── Grid ── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {concerts.map((concert, idx) => (
            <div
              key={concert.id}
              className="animate-fade-in-up h-full"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <ConcertCard concert={concert} />
            </div>
          ))}
        </div>

        {/* ── View All Link ── */}
        {showViewAll && (
          <div className="mt-14 text-center">
            <Link
              to="/concerts"
              className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-gray-300 backdrop-blur-sm transition-all hover:border-lime-400/20 hover:bg-lime-400/5 hover:text-lime-400 active:scale-95"
            >
              {t("grid_view_all")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
