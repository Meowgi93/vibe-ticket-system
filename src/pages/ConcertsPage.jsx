import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConcerts } from "../hooks/useConcerts";
import ConcertCard from "../components/ConcertCard";

export default function ConcertsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [genre, setGenre] = useState("All");
  const { t } = useTranslation();
  const { concerts, loading, error } = useConcerts();

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val) searchParams.set("search", val);
    else searchParams.delete("search");
    setSearchParams(searchParams, { replace: true });
  };


  const genres = useMemo(() => {
    const set = new Set(concerts.map((c) => c.genre));
    return ["All", ...Array.from(set).sort()];
  }, [concerts]);

  const filtered = useMemo(() => {
    return concerts.filter((c) => {
      const matchesGenre = genre === "All" || c.genre === genre;
      const matchesSearch =
        search.trim() === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.artist.toLowerCase().includes(search.toLowerCase()) ||
        c.venue.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [search, genre, concerts]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white">Loading concerts...</div>;
  }
  
  if (error) {
    return <div className="flex h-screen items-center justify-center text-pink-400">Error loading concerts: {error}</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      <section className="relative overflow-hidden pt-6 pb-16 sm:pt-8 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(48,110,249,0.12),transparent_70%)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-lime-400/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">

            <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
              {t("cp_title_1")} <span className="text-gradient-blue-lime">{t("cp_title_2")}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-gray-500 sm:text-lg">
              {t("cp_desc")}
            </p>
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="concert-search"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder={t("cp_search_placeholder")}
                className="w-full rounded-xl border border-white/10 bg-surface-800 py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="relative">
              <select
                id="genre-filter"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="h-full w-full appearance-none rounded-xl border border-white/10 bg-surface-800 py-3 pl-4 pr-10 text-sm text-white outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 sm:w-44"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g === "All" ? t("cp_all_genres") : g}
                  </option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {t("cp_showing")}{" "}
              <span className="font-semibold text-white">{filtered.length}</span>{" "}
              {filtered.length === 1 ? t("cp_concert") : t("cp_concerts")}
              {genre !== "All" && (
                <span>
                  {" "}{t("cp_in")} <span className="text-brand-400">{genre}</span>
                </span>
              )}
            </p>
            {(search || genre !== "All") && (
              <button
                onClick={() => { setSearch(""); setGenre("All"); }}
                className="text-xs font-medium text-pink-400 transition-colors hover:text-pink-300"
              >
                {t("cp_clear_filters")}
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((concert, idx) => (
                <div
                  key={concert.id}
                  className="animate-fade-in-up h-full"
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  <ConcertCard concert={concert} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-white">{t("cp_no_found")}</h3>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                {t("cp_try_adjusting")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
