import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ConcertCard({ concert }) {
  const { t } = useTranslation();
  const isSelling = concert.status === "Selling Out";

  return (
    <div
      id={`concert-card-${concert.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-900 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/10"
    >
      <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 shimmer-bg" />

      <Link to={`/concerts/${concert.id}`} className="relative aspect-[3/2] overflow-hidden block">
        <img
          src={concert.image}
          alt={concert.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent" />

        <span
          className={`ticket-badge absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 px-3.5 py-1 text-[11px] font-bold tracking-wide uppercase shadow-lg ${
            isSelling
              ? "bg-pink-500 text-white"
              : "bg-lime-400 text-surface-950"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isSelling ? "bg-white animate-pulse" : "bg-surface-950"
            }`}
          />
          {concert.status}
        </span>

        <div className="absolute bottom-3 left-3 z-20 flex gap-1.5">
          {(concert.tags || []).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>

      <div className="relative z-20 flex flex-1 flex-col gap-3 p-5">
        <Link to={`/concerts/${concert.id}`}>
          <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-brand-400">
            {concert.title}
          </h3>
        </Link>

        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-brand-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {concert.date} · {concert.time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-pink-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {concert.venue}, {concert.location}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-end justify-between border-t border-white/5 pt-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              {t("card_from")}
            </p>
            <p className="font-display text-lg font-bold text-lime-400">
              {concert.priceRange}
            </p>
          </div>
          <Link
            to={`/concerts/${concert.id}`}
            id={`buy-ticket-${concert.id}`}
            className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/40 hover:brightness-110 active:scale-95"
          >
            {t("card_get_tickets")}
          </Link>
        </div>
      </div>
    </div>
  );
}
