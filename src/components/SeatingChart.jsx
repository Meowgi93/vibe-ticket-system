import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export default function SeatingChart({ zones, selectedSeats, onSeatToggle, bookedSeats = [] }) {
  const { t } = useTranslation();

  // Build a Set of booked seat keys for fast lookup: "zoneId-row-col"
  const bookedSeatKeys = useMemo(() => {
    return new Set(bookedSeats.map(s => `${s.zoneId}-${s.row}-${s.col}`));
  }, [bookedSeats]);

  const seatsByZone = useMemo(() => {
    if (!zones) return [];
    return zones.map((zone) => {
      const seats = [];
      for (let r = 1; r <= zone.rows; r++) {
        for (let c = 1; c <= zone.cols; c++) {
          const seatId = `${zone.id}-${r}-${c}`;
          const isBooked = bookedSeatKeys.has(`${zone.id}-${r}-${c}`);
          seats.push({
            id: seatId,
            zoneId: zone.id,
            zoneName: zone.name,
            price: zone.price,
            row: r,
            col: c,
            status: isBooked ? "sold" : "available",
            color: zone.color,
          });
        }
      }
      return { ...zone, seats };
    });
  }, [zones, bookedSeatKeys]);

  const selectedSeatIds = selectedSeats.map((s) => s.id);

  if (!zones || zones.length === 0) return null;

  return (
    <div className="flex-1 flex flex-col rounded-2xl border border-white/5 bg-surface-900 p-6 shadow-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm border border-white/20 bg-brand-500 opacity-80" />
          {t("sc_available")}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          {t("sc_selected")}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-surface-800 opacity-50">
            <span className="text-[10px]">✕</span>
          </div>
          {t("sc_sold_out")}
        </div>
      </div>

      <div className="overflow-x-auto pb-8">
        <div className="min-w-[700px] flex flex-col items-center gap-12">
          {/* Stage */}
          <div className="flex h-16 w-3/4 items-center justify-center rounded-b-3xl border-t-4 border-brand-500 bg-gradient-to-b from-brand-500/20 to-transparent">
            <span className="font-display font-bold tracking-[0.3em] text-brand-400 opacity-80">
              {t("sc_stage")}
            </span>
          </div>

          {/* Zones */}
          <div className="flex flex-col items-center gap-10">
            {seatsByZone.map((zone) => {
              const textColor = zone.color.replace("bg-", "text-");
              return (
                <div key={zone.id} className="flex flex-col items-center gap-3">
                  <div className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>
                    {zone.name} - ฿{zone.price.toLocaleString()}
                  </div>
                  <div
                    className="grid gap-1.5 rounded-xl border border-white/5 bg-surface-800/40 p-4"
                    style={{ gridTemplateColumns: `repeat(${zone.cols}, minmax(0, 1fr))` }}
                  >
                    {zone.seats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      let seatClass = "flex h-6 w-6 cursor-pointer items-center justify-center rounded-t-lg rounded-b-sm text-[9px] font-bold transition-all hover:scale-110 active:scale-95 ";

                      if (seat.status === "sold") {
                        seatClass += "cursor-not-allowed bg-surface-800 text-gray-600 opacity-50";
                      } else if (isSelected) {
                        seatClass += "bg-white text-surface-900 shadow-[0_0_12px_rgba(255,255,255,0.7)]";
                      } else {
                        seatClass += `${zone.color} border border-white/20 text-surface-950/60 opacity-80 hover:opacity-100`;
                      }

                      return (
                        <button
                          key={seat.id}
                          disabled={seat.status === "sold"}
                          onClick={() => onSeatToggle(seat)}
                          className={seatClass}
                          title={`${t("sc_seat")} ${seat.id} - ฿${seat.price}`}
                        >
                          {seat.status === "sold" ? "✕" : seat.col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
