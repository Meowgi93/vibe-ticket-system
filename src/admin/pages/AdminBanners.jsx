import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminBanners() {
  const { authFetch } = useAuth();
  const [concerts, setConcerts] = useState([]);
  const [featured, setFeatured] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await authFetch('/api/concerts');
        if (res.ok) {
          const data = await res.json();
          setConcerts(data);
          const initial = {};
          data.forEach(c => {
            initial[c.id] = c.isFeatured;
          });
          setFeatured(initial);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [authFetch]);

  const toggleFeatured = async (id) => {
    const newValue = !featured[id];
    setFeatured((prev) => ({ ...prev, [id]: newValue }));
    try {
      await authFetch(`/api/admin/concerts/${id}/feature`, {
        method: 'PUT',
        body: JSON.stringify({ isFeatured: newValue })
      });
    } catch (err) {
      console.error(err);
      setFeatured((prev) => ({ ...prev, [id]: !newValue }));
    }
  };

  const featuredConcerts = concerts.filter((c) => featured[c.id]);

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Banner Management</h1>
      </div>

      {/* Featured Preview */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-display font-semibold text-white">Featured Preview</h2>
          <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 text-xs font-semibold">
            {featuredConcerts.length} active
          </span>
        </div>

        {featuredConcerts.length === 0 ? (
          <div className="rounded-2xl bg-surface-900 border border-white/5 p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            <p className="text-gray-500 text-sm">No concerts are featured. Toggle concerts below to add them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredConcerts.map((concert, idx) => (
              <div
                key={concert.id}
                className="group relative rounded-xl overflow-hidden border border-white/5 bg-surface-900"
              >
                <div className="aspect-[16/9] bg-surface-800 overflow-hidden">
                  <img
                    src={concert.image}
                    alt={concert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                      #{idx + 1}
                    </span>
                  </div>
                  <p className="text-white text-sm font-semibold truncate">{concert.title}</p>
                  <p className="text-gray-400 text-xs">{concert.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Concerts Grid */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-4">All Concerts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {concerts.map((concert) => (
            <div
              key={concert.id}
              className={`group relative rounded-2xl overflow-hidden border transition-all ${
                featured[concert.id]
                  ? "border-brand-500/30 bg-surface-900 shadow-lg shadow-brand-500/5"
                  : "border-white/5 bg-surface-900"
              }`}
            >
              <div className="aspect-[16/9] bg-surface-800 overflow-hidden">
                <img
                  src={concert.image}
                  alt={concert.title}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    featured[concert.id] ? "" : "opacity-50 grayscale"
                  } group-hover:opacity-100 group-hover:grayscale-0`}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>

              {/* Featured indicator */}
              {featured[concert.id] && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-lime-400/15 text-lime-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-lime-400/20">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                    Featured
                  </span>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{concert.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{concert.artist} · {concert.date}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{concert.venue}</p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleFeatured(concert.id)}
                    className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                      featured[concert.id] ? "bg-brand-500" : "bg-surface-700"
                    }`}
                    aria-label={`Toggle ${concert.title} as featured`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        featured[concert.id] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
