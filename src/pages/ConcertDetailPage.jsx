import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConcerts } from "../hooks/useConcerts";
import { useAuth } from "../context/AuthContext";
import SeatingChart from "../components/SeatingChart";
import PaymentModal from '../components/PaymentModal';
import TicketHolderModal from '../components/TicketHolderModal';
import WaitingRoom from "../components/WaitingRoom";

export default function ConcertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { concert, loading, error } = useConcerts(id);
  const { user, authFetch } = useAuth();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showHolderForm, setShowHolderForm] = useState(false);
  const [holderInfo, setHolderInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // Countdown timer in seconds
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);

  // Queue State
  const [queuePhase, setQueuePhase] = useState("open"); // open, countdown, join, waiting, ready
  const [timeUntilSale, setTimeUntilSale] = useState(0);
  const [queuePosition, setQueuePosition] = useState(0);
  const [totalInQueue, setTotalInQueue] = useState(0);

  // ✅ useMemo MUST be before any early returns
  const total = useMemo(() => selectedSeats.reduce((acc, seat) => acc + seat.price, 0), [selectedSeats]);
  const isSelling = concert?.status === "Selling Out";

  // Fetch booked seats for this concert
  useEffect(() => {
    if (!id || !selectedShowtimeId) {
      setBookedSeats([]);
      return;
    }
    fetch(`/api/concerts/${id}/seats?showtimeId=${selectedShowtimeId}`)
      .then(r => r.json())
      .then(data => setBookedSeats(Array.isArray(data) ? data : []))
      .catch(() => setBookedSeats([]));
  }, [id, selectedShowtimeId]);

  // Queue Polling Logic
  useEffect(() => {
    if (!id || !user) return;

    const checkQueue = async () => {
      try {
        const res = await authFetch(`/api/concerts/${id}/queue-status`);
        if (res.ok) {
          const data = await res.json();
          setQueuePhase(data.phase);
          if (data.timeUntilSale !== undefined) setTimeUntilSale(data.timeUntilSale);
          if (data.queuePosition !== undefined) setQueuePosition(data.queuePosition);
          if (data.totalInQueue !== undefined) setTotalInQueue(data.totalInQueue);
        }
      } catch (err) {
        console.error("Failed to fetch queue status");
      }
    };

    checkQueue();
    const interval = setInterval(checkQueue, 5000);
    return () => clearInterval(interval);
  }, [id, user, authFetch]);

  // Handle Join Queue
  const handleJoinQueue = async () => {
    if (!user) { navigate("/signin"); return; }
    try {
      const res = await authFetch(`/api/concerts/${id}/join-queue`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setQueuePhase("waiting");
        setQueuePosition(data.position);
        setTotalInQueue(data.totalInQueue);
      }
    } catch (err) {
      console.error("Failed to join queue");
    }
  };

  // Countdown Timer Logic
  useEffect(() => {
    let interval;
    if (selectedSeats.length > 0) {
      if (timeLeft === null) {
        setTimeLeft(900); // Start 15-minute countdown
      } else if (timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        setSelectedSeats([]);
        setTimeLeft(null);
        setShowPayment(false);
        alert(t("cd_session_expired") || "Session expired. Your seats have been released.");
      }
    } else {
      setTimeLeft(null); // Reset if no seats selected
    }
    return () => clearInterval(interval);
  }, [selectedSeats.length, timeLeft, t]);

  const formatTime = (seconds) => {
    if (seconds === null) return "";
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-gray-400">Loading concert details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-pink-400">Error: {error}</div>;
  }

  if (!concert) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-white">{t("cd_not_found")}</h1>
          <p className="mt-4 text-gray-400">{t("cd_not_exist")}</p>
          <Link to="/concerts" className="mt-8 inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110">
            {t("cd_back_to")}
          </Link>
        </div>
      </div>
    );
  }

  const handleSeatToggle = (seat) => {
    setSelectedSeats((prev) => {
      const isSelected = prev.find((s) => s.id === seat.id);
      if (isSelected) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= 4) { alert("Maximum 4 seats allowed per transaction."); return prev; }
      return [...prev, seat];
    });
  };

  const handleCheckout = () => {
    if (!user) { navigate("/signin"); return; }
    setShowHolderForm(true);
  };

  const handleHolderSubmit = (info) => {
    setHolderInfo(info);
    setShowHolderForm(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setBookingLoading(true);
    setBookingError("");
    try {
      const res = await authFetch("/api/tickets", {
        method: "POST",
        body: JSON.stringify({
          concertId: concert.id,
          showtimeId: selectedShowtimeId,
          seats: selectedSeats.map(s => ({
            zoneId: s.zoneId,
            row: s.row,
            col: s.col,
            price: s.price
          })),
          ...holderInfo
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      // Update booked seats locally
      setBookedSeats(prev => [
        ...prev,
        ...selectedSeats.map(s => ({ zoneId: s.zoneId, row: s.row, col: s.col }))
      ]);
      setShowPayment(false);
      setTimeLeft(null);
      setShowModal(true);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // If in a blocking queue phase, render Waiting Room
  if (user && ["countdown", "join", "waiting"].includes(queuePhase)) {
    return (
      <WaitingRoom
        concert={concert}
        queuePosition={queuePosition}
        totalInQueue={totalInQueue}
        phase={queuePhase}
        timeUntilSale={timeUntilSale}
        onEnterQueue={handleJoinQueue}
      />
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="relative h-[40vh] min-h-[320px] w-full overflow-hidden sm:h-[50vh]">
        <img src={concert.imageLarge || concert.image} alt={concert.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/60 to-surface-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950/50 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-20 z-10 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-black/60 sm:left-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t("cd_back")}
        </button>
      </div>

      <div className="relative z-10 mx-auto -mt-32 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <div className="animate-fade-in-up">
              <span className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase backdrop-blur-md ${
                isSelling ? "border border-pink-400/30 bg-pink-400/15 text-pink-300" : "border border-lime-400/30 bg-lime-400/15 text-lime-300"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isSelling ? "bg-pink-400 animate-pulse" : "bg-lime-400"}`} />
                {concert.status}
              </span>
              <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">{concert.title}</h1>
              <p className="mt-2 text-lg text-gray-400">{t("cd_by")} <span className="text-brand-400">{concert.artist}</span></p>
              <div className="mt-4 flex flex-wrap gap-2">
                {concert.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">{tag}</span>
                ))}
              </div>
            </div>

            <div className="animate-fade-in-up-delay-1 mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: t("cd_date_time"), value: concert.date, sub: concert.time, color: "bg-brand-500/10", iconColor: "text-brand-400" },
                { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z", label: t("cd_venue"), value: concert.venue, sub: concert.location, color: "bg-pink-400/10", iconColor: "text-pink-400" },
                { icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z", label: t("cd_price_range"), value: concert.priceRange, sub: concert.genre, color: "bg-lime-400/10", iconColor: "text-lime-400", valueColor: "text-lime-400" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-surface-900 p-5">
                  <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${item.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{item.label}</p>
                  <p className={`mt-1 font-semibold ${item.valueColor || "text-white"}`}>{item.value}</p>
                  <p className="text-sm text-gray-400">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="animate-fade-in-up-delay-2 mt-10">
              <h2 className="font-display text-xl font-bold text-white">{t("cd_about_event")}</h2>
              <p className="mt-4 leading-relaxed text-gray-400">{concert.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col">
            {concert.showtimes && concert.showtimes.length > 0 && (
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-white">{t("cd_select_showtime", "Select Showtime")}</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {concert.showtimes.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setSelectedShowtimeId(st.id);
                        setSelectedSeats([]);
                      }}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                        selectedShowtimeId === st.id
                          ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20"
                          : "bg-surface-800 border-white/10 text-gray-300 hover:border-brand-500/50 hover:bg-surface-700"
                      }`}
                    >
                      {st.date} - {st.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{t("sc_select_seats")}</h2>
                <p className="mt-1 text-sm text-gray-500">Max 4 seats per transaction</p>
              </div>
            </div>
            {concert.showtimes && concert.showtimes.length > 0 && !selectedShowtimeId ? (
              <div className="rounded-xl border border-white/5 bg-surface-900 p-12 text-center text-gray-500">
                Please select a showtime to view available seats.
              </div>
            ) : concert.zones && concert.zones.length > 0 ? (
              <SeatingChart
                zones={concert.zones}
                selectedSeats={selectedSeats}
                onSeatToggle={handleSeatToggle}
                bookedSeats={bookedSeats}
              />
            ) : (
              <div className="rounded-xl border border-white/5 bg-surface-900 p-12 text-center text-gray-500">
                Seating map not available for this venue.
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">{t("cd_select_tickets")}</h2>
                  <p className="mt-1 text-sm text-gray-500">{selectedSeats.length > 0 ? `${selectedSeats.length} ${t("sc_selected")}` : t("cd_choose_ticket")}</p>
                </div>
                {timeLeft !== null && (
                  <div className="rounded-lg bg-pink-500/10 px-3 py-1.5 border border-pink-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-pink-400">Time Left</p>
                    <p className="font-mono text-lg font-bold text-pink-500 leading-none mt-0.5">{formatTime(timeLeft)}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col rounded-2xl border border-white/5 bg-surface-900 p-6 shadow-2xl">
                <div className="space-y-3 min-h-[160px]">
                  {selectedSeats.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-surface-800/50 p-6 text-center text-sm text-gray-500">
                    Please select seats from the map
                  </div>
                ) : (
                  selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-800 p-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleSeatToggle(seat)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-gray-400 hover:bg-pink-400/20 hover:text-pink-400 transition-colors">✕</button>
                        <div>
                          <p className="text-sm font-semibold text-white">{seat.zoneName}</p>
                          <p className="mt-0.5 text-xs text-gray-500">Row {seat.row} - Seat {seat.col}</p>
                        </div>
                      </div>
                      <p className="font-display text-base font-bold text-lime-400">฿{seat.price.toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              {bookingError && (
                <div className="mt-4 rounded-xl border border-pink-400/20 bg-pink-400/10 px-4 py-3 text-sm text-pink-400">{bookingError}</div>
              )}

              <div className="my-6 h-px bg-white/5" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{t("cd_total")}</p>
                  <p className="font-display text-2xl font-bold text-white">{total > 0 ? `฿${total.toLocaleString()}` : "—"}</p>
                </div>
                <button
                  id="checkout-btn"
                  onClick={handleCheckout}
                  disabled={selectedSeats.length === 0 || bookingLoading || (concert.showtimes?.length > 0 && !selectedShowtimeId)}
                  className={`rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 ${
                    selectedSeats.length > 0 && !bookingLoading
                      ? "bg-gradient-to-r from-brand-500 to-brand-600 shadow-brand-500/20 hover:shadow-brand-500/40 hover:brightness-110"
                      : "cursor-not-allowed bg-surface-700 shadow-none"
                  }`}
                >
                  {bookingLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Booking...
                    </span>
                  ) : !user ? "Sign in to Book" : t("cd_checkout")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div className="h-24" />

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="animate-fade-in-up mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-surface-900 p-8 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-6 text-center font-display text-2xl font-bold text-white">{t("cd_booking_confirmed")}</h3>
            <p className="mt-2 text-center text-sm text-gray-400">{t("cd_reserved")}</p>
            <div className="mt-6 rounded-xl bg-surface-800 p-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">{t("cd_event")}</span><span className="font-medium text-white">{concert.title}</span></div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between"><span className="text-gray-500">{t("cd_quantity")}</span><span className="font-medium text-white">×{selectedSeats.length}</span></div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between"><span className="font-semibold text-gray-400">{t("cd_total_paid")}</span><span className="font-display text-lg font-bold text-lime-400">฿{total.toLocaleString()}</span></div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setShowModal(false); setSelectedSeats([]); }} className="flex-1 rounded-xl border border-white/10 bg-surface-800 py-3 text-sm font-semibold text-gray-300 transition-all hover:bg-surface-700">{t("cd_close")}</button>
              <Link to="/my-tickets" className="flex-1 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-center text-sm font-semibold text-white transition-all hover:brightness-110">{t("cd_view_my_tickets")}</Link>
            </div>
          </div>
        </div>
      )}

      <TicketHolderModal
        isOpen={showHolderForm}
        onClose={() => setShowHolderForm(false)}
        onContinue={handleHolderSubmit}
      />
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        totalAmount={total}
        isProcessing={bookingLoading}
        error={bookingError}
      />
    </div>
  );
}
