import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HeroBanner({ concerts = [] }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!concerts || concerts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % concerts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [concerts]);

  if (!concerts || concerts.length === 0) {
    return (
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden pt-32 pb-16 bg-surface-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin-slow"></div>
          <p className="text-brand-400 font-medium tracking-widest uppercase text-sm">Loading VIBE...</p>
        </div>
      </section>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? concerts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % concerts.length);
  };

  return (
    <section id="hero-banner" className="relative h-[75vh] min-h-[500px] w-full overflow-hidden">
      {/* ── Slides ── */}
      {concerts.map((concert, idx) => (
        <div
          key={concert.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear"
            style={{ 
              backgroundImage: `url(${concert.image})`,
              transform: idx === currentIndex ? "scale(1.05)" : "scale(1)"
            }}
          />
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-surface-950/50" />

          {/* Slide Content */}
          <div className="absolute inset-0 flex items-center pt-8">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl relative z-20">
                <span className="ticket-badge inline-flex items-center gap-2 bg-brand-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white mb-6 shadow-lg shadow-brand-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Featured Event
                </span>
                
                <h2 
                  className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-md line-clamp-2"
                  style={{ minHeight: '2.2em' }}
                >
                  {concert.title}
                </h2>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 text-gray-200 mb-10 text-sm sm:text-base font-medium">
                  <span className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/10 sm:w-[220px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{concert.date}</span>
                  </span>
                  <span className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/10 sm:w-[220px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{concert.venue}</span>
                  </span>
                </div>
                
                <Link
                  to={`/concerts/${concert.id}`}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm sm:text-base font-bold text-surface-950 shadow-xl shadow-white/10 transition-all hover:-translate-y-1 hover:shadow-white/20 hover:bg-gray-100"
                >
                  Get Tickets
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ── Navigation Arrows ── */}
      <div className="absolute right-4 bottom-8 sm:bottom-1/2 sm:translate-y-1/2 z-20 flex sm:flex-col gap-3 pr-2 sm:pr-6">
        <button
          onClick={handlePrev}
          className="group flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-brand-500 hover:border-brand-400 hover:scale-110"
          aria-label="Previous Slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="group flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-brand-500 hover:border-brand-400 hover:scale-110"
          aria-label="Next Slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Dot Indicators ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {concerts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-500 ${
              idx === currentIndex ? "w-8 bg-lime-400 shadow-[0_0_10px_rgba(202,251,18,0.5)]" : "w-2 bg-white/40 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      
    </section>
  );
}
