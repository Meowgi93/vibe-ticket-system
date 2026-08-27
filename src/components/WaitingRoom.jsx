import { useState, useEffect, useMemo, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Inline keyframes – injected once via <style>                       */
/* ------------------------------------------------------------------ */
const KEYFRAMES = `
@keyframes wr-float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.35; }
  50%      { transform: translateY(-40px) scale(1.15); opacity: 0.55; }
}
@keyframes wr-pulse-ring {
  0%   { transform: scale(0.85); opacity: 0.6; }
  70%  { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1.35); opacity: 0; }
}
@keyframes wr-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes wr-bounce-in {
  0%   { transform: scale(0); opacity: 0; }
  50%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes wr-dot-blink {
  0%, 80%, 100% { opacity: 0.25; }
  40% { opacity: 1; }
}
@keyframes wr-slide-up {
  0%   { transform: translateY(32px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes wr-glow {
  0%, 100% { box-shadow: 0 0 20px 2px rgba(163,230,53,0.15); }
  50%      { box-shadow: 0 0 40px 8px rgba(163,230,53,0.35); }
}
@keyframes wr-ticker {
  0%   { transform: translateY(8px); opacity: 0; }
  20%  { transform: translateY(0); opacity: 1; }
  80%  { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-8px); opacity: 0; }
}
@keyframes wr-bg-drift {
  0%   { transform: translate(0, 0) rotate(0deg); }
  50%  { transform: translate(30px, -20px) rotate(180deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}
`;

/* ------------------------------------------------------------------ */
/*  Particles background                                               */
/* ------------------------------------------------------------------ */
function Particles({ color = "brand-500", count = 28 }) {
  const dots = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 3 + Math.random() * 5;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size,
        delay: `${Math.random() * 6}s`,
        duration: `${4 + Math.random() * 6}s`,
      };
    });
  }, [count]);

  const colorMap = {
    "brand-500": "rgb(59,130,246)",
    "pink-400": "rgb(244,114,182)",
    "lime-400": "rgb(163,230,53)",
  };
  const fill = colorMap[color] || colorMap["brand-500"];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full"
          style={{
            width: d.size,
            height: d.size,
            left: d.left,
            top: d.top,
            background: fill,
            animation: `wr-float ${d.duration} ${d.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Large background blobs                                             */
/* ------------------------------------------------------------------ */
function BackgroundBlobs({ phase }) {
  const blobColor =
    phase === "ready"
      ? "rgba(163,230,53,0.08)"
      : phase === "waiting" || phase === "pre_queue" ? "rgba(244,114,182,0.07)"
        : "rgba(59,130,246,0.08)";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{
          background: blobColor,
          animation: "wr-bg-drift 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full blur-[100px]"
        style={{
          background: blobColor,
          animation: "wr-bg-drift 25s 5s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Countdown timer display                                            */
/* ------------------------------------------------------------------ */
function CountdownDisplay({ seconds }) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  const segments = [
    { label: "HRS", value: h },
    { label: "MIN", value: m },
    { label: "SEC", value: s },
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <span
              className="font-display text-5xl font-bold tracking-tight text-white sm:text-7xl"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {seg.value}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              {seg.label}
            </span>
          </div>
          {i < segments.length - 1 && (
            <span className="font-display -mt-5 text-4xl font-bold text-brand-500 sm:text-5xl">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated loading dots                                              */
/* ------------------------------------------------------------------ */
function LoadingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-pink-400"
          style={{
            animation: `wr-dot-blink 1.4s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkmark SVG with draw animation                                  */
/* ------------------------------------------------------------------ */
function AnimatedCheck() {
  return (
    <div
      className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-lime-400/30 bg-lime-400/10 sm:h-36 sm:w-36"
      style={{ animation: "wr-bounce-in 0.6s ease-out forwards, wr-glow 2s ease-in-out infinite" }}
    >
      {/* pulse rings */}
      {[0, 1].map((i) => (
        <span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-lime-400/20"
          style={{
            animation: `wr-pulse-ring 2s ${i * 0.8}s ease-out infinite`,
          }}
        />
      ))}
      <svg
        className="h-14 w-14 text-lime-400 sm:h-16 sm:w-16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline
          points="4 12 10 18 20 6"
          style={{
            strokeDasharray: 30,
            strokeDashoffset: 30,
            animation: "wr-draw 0.5s 0.4s ease-out forwards",
          }}
        />
      </svg>
      <style>{`@keyframes wr-draw { to { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Queue progress bar                                                 */
/* ------------------------------------------------------------------ */
function QueueProgress({ position, total }) {
  const pct = total > 0 ? Math.max(2, ((total - position) / total) * 100) : 0;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex justify-between text-xs text-white/40">
        <span>Front of line</span>
        <span>You</span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-950/80 ring-1 ring-white/5">
        {/* shimmer base */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 30%, rgba(244,114,182,0.08) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "wr-shimmer 2.5s linear infinite",
          }}
        />
        {/* filled bar */}
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-brand-500 to-pink-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        >
          {/* glow dot at tip */}
          <span className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-pink-400 shadow-[0_0_10px_2px_rgba(244,114,182,0.5)]" />
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  WaitingRoom                                                        */
/* ================================================================== */
export default function WaitingRoom({
  concert = {},
  queuePosition = 0,
  totalInQueue = 0,
  phase = "countdown",
  timeUntilSale = 0,
  onEnterQueue,
}) {
  /* --- countdown tick -------------------------------------------- */
  const [displayTime, setDisplayTime] = useState(Math.max(0, timeUntilSale));

  useEffect(() => {
    setDisplayTime(Math.max(0, timeUntilSale));
  }, [timeUntilSale]);

  useEffect(() => {
    if (phase !== "countdown" || displayTime <= 0) return;
    const id = setInterval(() => {
      setDisplayTime((t) => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, displayTime > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --- rotating tip messages for waiting phase -------------------- */
  const tips = useMemo(
    () => [
      "Hang tight — you're getting closer!",
      "Great things come to those who wait…",
      "Your tickets are almost within reach!",
      "Stay here — don't refresh!",
      "Almost there — hold your spot!",
    ],
    [],
  );
  const [tipIdx, setTipIdx] = useState(0);
  useEffect(() => {
    if (phase !== "waiting") return;
    const id = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 4500);
    return () => clearInterval(id);
  }, [phase, tips]);

  /* --- inject keyframes once ------------------------------------- */
  useEffect(() => {
    const id = "wr-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  /* --- button hover state ---------------------------------------- */
  const [hovered, setHovered] = useState(false);

  /* --- render ---------------------------------------------------- */
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-surface-950 px-4 py-10">
      {/* Background */}
      <BackgroundBlobs phase={phase} />
      <Particles
        color={phase === "ready" ? "lime-400" : phase === "waiting" || phase === "pre_queue" ? "pink-400" : "brand-500"}
        count={phase === "ready" ? 35 : 28}
      />

      {/* =================== COUNTDOWN & JOIN PHASE =================== */}
      {(phase === "countdown" || phase === "join") && (
        <div
          className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8 rounded-2xl border border-white/10 bg-surface-900/70 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12"
          style={{ animation: "wr-slide-up 0.6s ease-out both" }}
        >
          {/* artist pill */}
          {concert.artist && (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-500">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shadow-[0_0_6px_1px_rgba(59,130,246,0.6)]" />
              {concert.artist}
            </span>
          )}

          {/* title */}
          {concert.title && (
            <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              {concert.title}
            </h1>
          )}

          {/* timer or message */}
          {phase === "countdown" ? (
            <>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/50">
                Tickets go on sale in
              </p>
              <CountdownDisplay seconds={displayTime} />
            </>
          ) : (
            <div className="py-8">
              <span className="font-display text-4xl font-bold text-lime-400 sm:text-5xl" style={{ animation: "wr-bounce-in 0.5s ease-out" }}>
                Sale is Open!
              </span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={phase === "join" ? onEnterQueue : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={phase === "countdown"}
            className={`group relative mt-2 w-full overflow-hidden rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-widest shadow-lg transition-all duration-300 ${
              phase === "countdown"
                ? "cursor-not-allowed bg-surface-800 text-white/30"
                : "bg-gradient-to-r from-brand-500 to-brand-500/80 text-white hover:shadow-brand-500/25 hover:shadow-2xl active:scale-[0.97]"
            }`}
          >
            {/* shimmer overlay */}
            {phase === "join" && (
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: hovered ? "wr-shimmer 1.2s linear infinite" : "none",
                }}
              />
            )}
            <span className="relative z-10">{phase === "countdown" ? "Waiting..." : "Join Waiting Room"}</span>
          </button>

          {/* micro-copy */}
          <p className="text-xs text-white/30">
            {phase === "countdown"
              ? "The button will activate when the sale begins."
              : "You'll be placed in a randomized queue."}
          </p>
        </div>
      )}

            {/* =================== PRE-QUEUE PHASE =================== */}
      {phase === "pre_queue" && (
        <div
          className="relative z-10 flex w-full max-w-lg flex-col items-center gap-7 rounded-2xl border 
border-white/10 bg-surface-900/70 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12"
          style={{ animation: "wr-slide-up 0.6s ease-out both" }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              Waiting Room
            </span>
            <span className="font-display text-4xl font-extrabold text-white sm:text-5xl my-4">
              <span className="bg-gradient-to-r from-brand-500 to-pink-400 bg-clip-text text-transparent">
                You're in line!
              </span>
            </span>
            <span className="text-sm text-white/40 mb-4">
              Your queue position will be assigned randomly when the sale starts.
            </span>
            <CountdownDisplay seconds={timeUntilSale} />
          </div>

          {/* Animated dots */}
          <div className="flex items-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-pink-400"
                style={{
                  animation: `wr-pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-white/30">
            Please don't refresh the page
          </p>
        </div>
      )}

      {/* =================== WAITING PHASE ===================== */}
      {phase === "waiting" && (
        <div
          className="relative z-10 flex w-full max-w-lg flex-col items-center gap-7 rounded-2xl border border-white/10 bg-surface-900/70 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12"
          style={{ animation: "wr-slide-up 0.6s ease-out both" }}
        >
          {/* position badge */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              Your position
            </span>
            <span className="font-display text-5xl font-extrabold text-white sm:text-6xl">
              <span className="bg-gradient-to-r from-brand-500 to-pink-400 bg-clip-text text-transparent">
                #{queuePosition.toLocaleString()}
              </span>
            </span>
            <span className="text-sm text-white/40">
              of {totalInQueue.toLocaleString()} in line
            </span>
          </div>

          {/* progress */}
          <QueueProgress position={queuePosition} total={totalInQueue} />

          {/* status */}
          <div className="flex items-center gap-2 text-sm font-medium text-white/60">
            Waiting for your turn <LoadingDots />
          </div>

          {/* rotating tips */}
          <p
            key={tipIdx}
            className="min-h-[1.25rem] text-sm italic text-white/30"
            style={{ animation: "wr-ticker 4.5s ease-in-out" }}
          >
            {tips[tipIdx]}
          </p>

          {/* warning */}
          <div className="flex items-center gap-2 rounded-lg border border-pink-500/20 bg-pink-500/5 px-4 py-2.5 text-xs text-pink-400">
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>Don't close this tab or you'll lose your spot</span>
          </div>

          {/* concert info */}
          {(concert.title || concert.artist) && (
            <div className="mt-1 flex flex-col gap-0.5 text-xs text-white/25">
              {concert.title && <span>{concert.title}</span>}
              {concert.artist && <span>{concert.artist}</span>}
            </div>
          )}
        </div>
      )}

      {/* =================== READY PHASE ======================= */}
      {phase === "ready" && (
        <div
          className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl border border-white/10 bg-surface-900/70 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12"
          style={{ animation: "wr-slide-up 0.5s ease-out both" }}
        >
          <AnimatedCheck />

          <h2
            className="font-display text-3xl font-extrabold text-white sm:text-4xl"
            style={{ animation: "wr-slide-up 0.5s 0.3s ease-out both" }}
          >
            It's Your Turn!
          </h2>

          <p
            className="max-w-xs text-sm text-white/50"
            style={{ animation: "wr-slide-up 0.5s 0.45s ease-out both" }}
          >
            You're being redirected to select your seats. Get ready to grab the best spots!
          </p>

          {/* pulsing bar */}
          <div
            className="h-1 w-40 overflow-hidden rounded-full bg-surface-950"
            style={{ animation: "wr-slide-up 0.5s 0.6s ease-out both" }}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-400 to-lime-400/60"
              style={{
                animation: "wr-shimmer 1.5s linear infinite",
                backgroundSize: "200% 100%",
                backgroundImage:
                  "linear-gradient(90deg, rgb(163,230,53) 0%, rgba(163,230,53,0.3) 50%, rgb(163,230,53) 100%)",
              }}
            />
          </div>

          {/* concert info */}
          {(concert.title || concert.artist) && (
            <div
              className="flex flex-col gap-0.5 text-xs text-white/25"
              style={{ animation: "wr-slide-up 0.5s 0.7s ease-out both" }}
            >
              {concert.title && <span>{concert.title}</span>}
              {concert.artist && <span>{concert.artist}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
