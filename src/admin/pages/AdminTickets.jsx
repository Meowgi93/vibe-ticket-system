import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const filterOptions = ["All", "Confirmed", "Pending", "Cancelled"];

const statusStyles = {
  Confirmed: { badge: "bg-lime-400/10 text-lime-400", dot: "bg-lime-400" },
  Pending: { badge: "bg-yellow-400/10 text-yellow-400", dot: "bg-yellow-400" },
  Cancelled: { badge: "bg-pink-400/10 text-pink-400", dot: "bg-pink-400" },
};

export default function AdminTickets() {
  const { authFetch } = useAuth();
  const [ticketsData, setTicketsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await authFetch('/api/admin/tickets');
        if (res.ok) {
          const data = await res.json();
          setTicketsData(data.map(t => ({
            id: `VB-${t.id.toString().padStart(6, '0')}`,
            customerName: t.user.name,
            customerEmail: t.user.email,
            concertTitle: t.concert.title,
            zone: t.bookedSeats[0]?.zone?.name || 'N/A',
            seats: t.bookedSeats.length,
            totalPrice: t.totalPaid,
            status: t.status === 'confirmed' ? 'Confirmed' : (t.status === 'cancelled' ? 'Cancelled' : 'Pending'),
            bookedAt: new Date(t.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTickets();
  }, [authFetch]);

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div></div>;
  }

  const filtered = ticketsData.filter((ticket) => {
    const matchFilter = filter === "All" || ticket.status === filter;
    const matchSearch =
      search === "" ||
      ticket.customerName.toLowerCase().includes(search.toLowerCase()) ||
      ticket.concertTitle.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    All: ticketsData.length,
    Confirmed: ticketsData.filter((t) => t.status === "Confirmed").length,
    Pending: ticketsData.filter((t) => t.status === "Pending").length,
    Cancelled: ticketsData.filter((t) => t.status === "Cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Tickets</h1>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === opt
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                  : "bg-surface-800 text-gray-400 hover:text-white hover:bg-surface-700"
              }`}
            >
              {opt}
              <span className={`ml-1.5 text-xs ${filter === opt ? "text-white/70" : "text-gray-600"}`}>
                {counts[opt]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-auto">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search by customer or concert..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 bg-surface-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-900 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">ID</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Concert</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Zone</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Seats</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Booked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-500">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-surface-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-gray-400 text-xs">{ticket.id}</td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-white font-medium">{ticket.customerName}</p>
                        <p className="text-gray-500 text-xs">{ticket.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300 max-w-[200px] truncate">{ticket.concertTitle}</td>
                    <td className="px-5 py-3.5 text-gray-400">{ticket.zone}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-center">{ticket.seats}</td>
                    <td className="px-5 py-3.5 text-white font-semibold">฿{ticket.totalPrice.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[ticket.status].badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles[ticket.status].dot}`} />
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{ticket.bookedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
