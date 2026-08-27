import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [statsData, setStatsData] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    totalConcerts: 0,
    totalUsers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          authFetch('/api/admin/stats'),
          authFetch('/api/admin/tickets')
        ]);
        
        if (isMounted && statsRes.ok) {
          setStatsData(await statsRes.json());
        }
        if (isMounted && ticketsRes.ok) {
          const tickets = await ticketsRes.json();
          setRecentBookings(tickets.slice(0, 5).map(t => ({
            id: `VB-${t.id.toString().padStart(6, '0')}`,
            customer: t.user.name,
            concert: t.concert.title,
            zone: t.bookedSeats[0]?.zone?.name || 'N/A',
            amount: `฿${t.totalPaid.toLocaleString()}`,
            status: t.status === 'confirmed' ? 'Confirmed' : 'Pending'
          })));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [authFetch]);

  const stats = [
    {
      label: "Total Revenue",
      value: `฿${statsData.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      up: true,
      gradient: "from-brand-600/20 to-brand-500/5",
      iconBg: "bg-brand-500/15",
      iconColor: "text-brand-400",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      label: "Tickets Sold",
      value: statsData.totalTickets.toLocaleString(),
      change: "+8.2%",
      up: true,
      gradient: "from-lime-500/20 to-lime-400/5",
      iconBg: "bg-lime-500/15",
      iconColor: "text-lime-400",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
        </svg>
      ),
    },
    {
      label: "Active Concerts",
      value: statsData.totalConcerts.toLocaleString(),
      change: "+2",
      up: true,
      gradient: "from-pink-500/20 to-pink-400/5",
      iconBg: "bg-pink-500/15",
      iconColor: "text-pink-400",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V4.846a2.25 2.25 0 0 0-1.632-2.163l-6.75-1.93A2.25 2.25 0 0 0 6 2.906v13.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 16.403v1.847a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 6 14.653v1.75Z" />
        </svg>
      ),
    },
    {
      label: "Total Users",
      value: statsData.totalUsers.toLocaleString(),
      change: "-1.4%",
      up: false,
      gradient: "from-surface-600/40 to-surface-700/10",
      iconBg: "bg-surface-600/30",
      iconColor: "text-gray-300",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} border border-white/5 p-5`}
          >
            {/* Subtle shimmer overlay */}
            <div className="absolute inset-0 shimmer-bg pointer-events-none opacity-40" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                <p className="text-2xl font-display font-bold text-white mt-1.5">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} ${stat.iconColor} rounded-xl p-2.5 shrink-0`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-white">Recent Bookings</h2>
          <button className="text-sm text-brand-400 hover:text-brand-300 transition-colors font-medium">
            View All →
          </button>
        </div>

        <div className="rounded-2xl bg-surface-900 border border-white/5 overflow-hidden">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Booking ID</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Concert</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Zone</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-gray-400 text-xs">{booking.id}</td>
                    <td className="px-5 py-3.5 text-white font-medium">{booking.customer}</td>
                    <td className="px-5 py-3.5 text-gray-300 max-w-[200px] truncate">{booking.concert}</td>
                    <td className="px-5 py-3.5 text-gray-400">{booking.zone}</td>
                    <td className="px-5 py-3.5 text-white font-semibold">{booking.amount}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "Confirmed"
                            ? "bg-lime-400/10 text-lime-400"
                            : "bg-yellow-400/10 text-yellow-400"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${booking.status === "Confirmed" ? "bg-lime-400" : "bg-yellow-400"}`} />
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
