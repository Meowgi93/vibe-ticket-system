import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useAuth } from "../context/AuthContext";

export default function MyTicketsPage() {
  const { t } = useTranslation();
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    authFetch("/api/tickets")
      .then(r => r.json())
      .then(data => {
        setTickets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load tickets");
        setLoading(false);
      });
  }, [user, authFetch]);

  const flattenedTickets = tickets.flatMap(ticket => 
    ticket.bookedSeats && ticket.bookedSeats.length > 0
      ? ticket.bookedSeats.map(seat => ({ ...ticket, seat }))
      : [{ ...ticket, seat: null }]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-gray-400">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold text-white">Sign in to view your tickets</h2>
          <p className="mt-2 text-gray-500">You need to be signed in to access your tickets.</p>
          <Link
            to="/signin"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24">
      <section className="relative overflow-hidden pt-6 pb-16 sm:pt-8 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(202,251,18,0.08),transparent_70%)]" />
        <div className="pointer-events-none absolute left-0 top-1/4 h-48 w-48 rounded-full bg-pink-400/5 blur-[80px]" />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
            {t("mt_title_1")} <span className="text-gradient-pink-blue">{t("mt_title_2")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-gray-500 sm:text-lg">{t("mt_desc")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-pink-400/20 bg-pink-400/10 px-4 py-3 text-sm text-pink-400">{error}</div>
        )}

        {flattenedTickets.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-surface-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-white">No tickets yet</h3>
            <p className="mt-2 text-sm text-gray-500">Browse upcoming concerts and book your first ticket!</p>
            <Link to="/concerts" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95">
              Browse Concerts
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {flattenedTickets.map((ft, idx) => (
              <div
                key={`${ft.id}-${ft.seat ? ft.seat.id : 'no-seat'}`}
                className="animate-fade-in-up group relative rounded-2xl border border-surface-950/10 bg-[#f8f9fa] shadow-2xl transition-all hover:border-brand-500/30 hover:shadow-brand-500/10"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Image (Stub) */}
                  <div className="relative shrink-0 p-4 lg:p-6 lg:w-[280px] xl:w-[320px] flex items-center justify-center">
                    <img
                      src={ft.concert.image}
                      alt={ft.concert.title}
                      className="h-48 w-full rounded-xl object-cover lg:h-full lg:min-h-[240px]"
                    />
                  </div>

                  {/* Horizontal Divider for Mobile */}
                  <div className="relative flex lg:hidden items-center justify-between h-8 w-full shrink-0 z-10">
                    <div className="absolute -left-4 h-8 w-8 rounded-full bg-surface-950"></div>
                    <div className="w-full h-px border-t-2 border-dashed border-surface-950/20 mx-4"></div>
                    <div className="absolute -right-4 h-8 w-8 rounded-full bg-surface-950"></div>
                  </div>

                  {/* Vertical Divider 1 for Desktop */}
                  <div className="relative hidden lg:flex flex-col items-center justify-between w-8 shrink-0 z-10">
                    <div className="absolute -top-4 h-8 w-8 rounded-full bg-surface-950"></div>
                    <div className="h-full w-px border-l-2 border-dashed border-surface-950/20 my-4"></div>
                    <div className="absolute -bottom-4 h-8 w-8 rounded-full bg-surface-950"></div>
                  </div>

                  {/* Middle: Details */}
                  <div className="flex flex-1 flex-col justify-between p-6 lg:py-8 lg:px-4">
                    <div>
                      <p className="text-sm font-medium text-brand-600 mb-2">
                        {ft.showtime?.date || ft.concert.date} <span className="mx-2 text-surface-950/20">•</span> {ft.concert.venue}
                      </p>
                      <Link to={`/concerts/${ft.concert.id}`} className="font-display text-2xl font-extrabold text-surface-950 transition-colors hover:text-brand-600">
                        {ft.concert.title}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">By {ft.concert.artist}</p>
                      
                      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                        <div className="flex-1 min-w-[200px] w-full">
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Zone / โซน</p>
                              <p className="text-sm font-medium text-surface-950 mt-1">{ft.seat?.zone?.name || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Floor / ชั้น</p>
                              <p className="text-sm font-medium text-surface-950 mt-1">{ft.seat?.zone?.name?.includes("VIP") ? "1 (Ground)" : "2 (Tier)"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Row / แถว</p>
                              <p className="text-sm font-medium text-surface-950 mt-1">{ft.seat?.row ? `R${ft.seat.row}` : "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Seat / ที่นั่ง</p>
                              <p className="text-sm font-medium text-surface-950 mt-1">{ft.seat?.col ? `S${ft.seat.col}` : "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-surface-950/10 pt-4">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          ft.status === "confirmed" ? "bg-green-600/10 text-green-700" : "bg-pink-600/10 text-pink-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${ft.status === "confirmed" ? "bg-green-600" : "bg-pink-600 animate-pulse"}`} />
                          {ft.status}
                        </span>
                        <span className="text-[10px] text-gray-500">{t("mt_id")} TKT-{String(ft.id).padStart(3, "0")}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/concerts/${ft.concert.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-xs font-bold text-brand-600 transition-all hover:bg-brand-100 hover:text-brand-700 active:scale-95"
                        >
                          {t("mt_view_event")}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Divider for Mobile */}
                  <div className="relative flex lg:hidden items-center justify-between h-8 w-full shrink-0 z-10 bg-[linear-gradient(to_bottom,transparent_50%,#f1f3f5_50%)]">
                    <div className="absolute -left-4 h-8 w-8 rounded-full bg-surface-950"></div>
                    <div className="w-full h-px border-t-2 border-dashed border-surface-950/20 mx-4"></div>
                    <div className="absolute -right-4 h-8 w-8 rounded-full bg-surface-950"></div>
                  </div>

                  {/* Vertical Divider 2 for Desktop */}
                  <div className="relative hidden lg:flex flex-col items-center justify-between w-8 shrink-0 z-10 bg-[linear-gradient(to_right,transparent_50%,#f1f3f5_50%)]">
                    <div className="absolute -top-4 h-8 w-8 rounded-full bg-surface-950"></div>
                    <div className="h-full w-px border-l-2 border-dashed border-surface-950/20 my-4"></div>
                    <div className="absolute -bottom-4 h-8 w-8 rounded-full bg-surface-950"></div>
                  </div>

                  {/* Right: Date Stub */}
                  {(() => {
                    const dateStr = ft.showtime?.date || ft.concert.date || "";
                    const [datePart] = dateStr.split(" "); // Get '13/06/2026' from '13/06/2026 (Day 1)'
                    const [d, m, y] = datePart.split("/");
                    
                    const monthNames = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                    const month = monthNames[parseInt(m, 10)] || "N/A";
                    const day = d || "--";
                    const year = y || "----";

                    return (
                      <div className="flex shrink-0 flex-col items-center justify-center bg-[#f1f3f5] p-6 lg:w-48 rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl">
                        <div className="text-center mb-6">
                          <span className="block font-display text-lg font-medium text-gray-500 uppercase">{month}</span>
                          <span className="block font-display text-5xl font-black tracking-tighter text-surface-950 leading-none my-1">{day}</span>
                          <span className="block font-display text-base font-bold text-gray-500">{year}</span>
                        </div>
                        {ft.status === "confirmed" && ft.seat && (
                          <div className="w-full mt-2">
                            <Link
                              to={`/tickets/${ft.id}/print?seatId=${ft.seat.id}`}
                              className="inline-flex w-full justify-center items-center gap-1.5 rounded-lg bg-lime-400 px-4 py-3 text-xs font-bold text-surface-950 transition-all hover:bg-lime-300 hover:shadow-lg hover:shadow-lime-400/30 active:scale-95"
                              title={`E-Ticket for ${ft.seat.zone?.name} R${ft.seat.row}-S${ft.seat.col}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              E-Ticket
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}

        {tickets.length > 0 && (
          <div className="mt-16 text-center">
            <h3 className="font-display text-lg font-bold text-white">{t("mt_want_more")}</h3>
            <p className="mt-2 text-sm text-gray-500">{t("mt_browse_upcoming")}</p>
            <Link
              to="/concerts"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
            >
              {t("mt_browse_concerts")}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
