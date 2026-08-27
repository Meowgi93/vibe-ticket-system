import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  title: "",
  artist: "",
  date: "",
  time: "",
  venue: "",
  location: "",
  status: "Available",
  priceRange: "",
  genre: "",
  description: "",
  image: "",
  tags: "",
  saleStartAt: "",
  isFeatured: false,
  showtimes: [],
  zones: []
};

export default function AdminConcerts() {
  const { authFetch } = useAuth();
  const [concerts, setConcerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const loadConcerts = async () => {
    try {
      const res = await fetch('/api/concerts');
      if (res.ok) setConcerts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadConcerts(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleShowtimeChange = (index, field, value) => {
    const newShowtimes = [...form.showtimes];
    newShowtimes[index] = { ...newShowtimes[index], [field]: value };
    setForm({ ...form, showtimes: newShowtimes });
  };

  const addShowtime = () => {
    setForm({
      ...form,
      showtimes: [...form.showtimes, { date: '', time: '' }]
    });
  };

  const removeShowtime = (index) => {
    const newShowtimes = form.showtimes.filter((_, i) => i !== index);
    setForm({ ...form, showtimes: newShowtimes });
  };

  const handleZoneChange = (index, field, value) => {
    const newZones = [...form.zones];
    newZones[index] = { ...newZones[index], [field]: value };
    setForm({ ...form, zones: newZones });
  };

  const addZone = () => {
    setForm({
      ...form,
      zones: [...form.zones, { zoneId: '', name: '', price: '', color: '#f59e0b', rows: 10, cols: 20 }]
    });
  };

  const removeZone = (index) => {
    const newZones = form.zones.filter((_, i) => i !== index);
    setForm({ ...form, zones: newZones });
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (concert) => {
    setEditingId(concert.id);
    setForm({
      title: concert.title,
      artist: concert.artist,
      date: concert.date,
      time: concert.time,
      venue: concert.venue,
      location: concert.location,
      status: concert.status,
      priceRange: concert.priceRange,
      genre: concert.genre,
      description: concert.description,
      image: concert.image || "",
      tags: Array.isArray(concert.tags) ? concert.tags.join(', ') : (concert.tags || ""),
      saleStartAt: concert.saleStartAt ? new Date(concert.saleStartAt).toISOString().slice(0, 16) : "",
      isFeatured: concert.isFeatured || false,
      showtimes: concert.showtimes || [],
      zones: concert.zones || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const res = await authFetch(`/api/concerts/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        if (res.ok) {
          const updated = await res.json();
          setConcerts((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        }
      } else {
        const res = await authFetch('/api/concerts', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        if (res.ok) {
          const created = await res.json();
          setConcerts((prev) => [...prev, created]);
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await authFetch(`/api/concerts/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setConcerts((prev) => prev.filter((c) => c.id !== deleteId));
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
    setDeleteId(null);
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div></div>;
  }

  const statusBadge = (status) => {
    const styles = {
      Available: "bg-lime-400/10 text-lime-400",
      "Selling Out": "bg-pink-400/10 text-pink-400",
    };
    return styles[status] || "bg-gray-400/10 text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Concerts</h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Concert
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-900 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Concert</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Artist</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Venue</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Price Range</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {concerts.map((concert) => (
                <tr key={concert.id} className="hover:bg-surface-800/50 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-800 shrink-0">
                        <img
                          src={concert.image}
                          alt={concert.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                      <span className="text-white font-medium max-w-[220px] truncate">{concert.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-300">{concert.artist}</td>
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{concert.date}</td>
                  <td className="px-5 py-3 text-gray-400">{concert.venue}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(concert.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${concert.status === "Available" ? "bg-lime-400" : "bg-pink-400"}`} />
                      {concert.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{concert.priceRange}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(concert)}
                        className="p-2 rounded-lg hover:bg-surface-700 text-gray-400 hover:text-brand-400 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteId(concert.id)}
                        className="p-2 rounded-lg hover:bg-pink-500/10 text-gray-400 hover:text-pink-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-white">
                {editingId ? "Edit Concert" : "Add New Concert"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-surface-800 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "title", label: "Title", type: "text", full: true },
                  { name: "artist", label: "Artist", type: "text" },
                  { name: "genre", label: "Genre", type: "text" },
                  { name: "date", label: "Date", type: "text", placeholder: "e.g. 13/06/2026" },
                  { name: "time", label: "Time", type: "text", placeholder: "e.g. 19:00" },
                  { name: "venue", label: "Venue", type: "text" },
                  { name: "location", label: "Location", type: "text" },
                  { name: "priceRange", label: "Price Range", type: "text", placeholder: "e.g. ฿2,500 - ฿7,500" },
                  { name: "image", label: "Image URL", type: "text", placeholder: "https://...", full: true },
                  { name: "tags", label: "Tags", type: "text", placeholder: "Pop, K-pop, Live", full: true },
                  { name: "saleStartAt", label: "Sale Start Time", type: "datetime-local", full: true },
                ].map((field) => (
                  <div key={field.name} className={field.full ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      lang={field.type === 'datetime-local' ? 'th-TH' : undefined}
                      className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all calendar-icon-lime"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                  >
                    <option value="Available">Available</option>
                    <option value="Selling Out">Selling Out</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-brand-500' : 'bg-surface-800 border border-white/10'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.isFeatured ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Featured Concert
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Showtimes Configuration */}
              <div className="pt-4 border-t border-white/5 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Showtimes</h3>
                  <button
                    type="button"
                    onClick={addShowtime}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Showtime
                  </button>
                </div>
                
                <div className="space-y-3">
                  {form.showtimes.map((st, idx) => (
                    <div key={idx} className="p-3 bg-surface-950 rounded-xl border border-white/5 grid grid-cols-5 gap-3 items-end">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date (e.g. 13/06/2026)</label>
                        <input type="text" value={st.date} onChange={(e) => handleShowtimeChange(idx, 'date', e.target.value)} className="w-full bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50" required />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Time (e.g. 19:00)</label>
                        <input type="text" value={st.time} onChange={(e) => handleShowtimeChange(idx, 'time', e.target.value)} className="w-full bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50" required />
                      </div>
                      <div className="col-span-1 flex items-center justify-end h-[34px]">
                        <button type="button" onClick={() => removeShowtime(idx)} className="p-1.5 rounded-lg hover:bg-pink-500/10 text-gray-500 hover:text-pink-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zones Configuration */}
              <div className="pt-4 border-t border-white/5 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Zones & Pricing</h3>
                  <button
                    type="button"
                    onClick={addZone}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Zone
                  </button>
                </div>
                
                <div className="space-y-3">
                  {form.zones.map((zone, idx) => (
                    <div key={idx} className="p-3 bg-surface-950 rounded-xl border border-white/5 grid grid-cols-2 sm:grid-cols-12 gap-3 items-end">
                      <div className="col-span-2 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">ID (e.g. VIP)</label>
                        <input type="text" value={zone.zoneId} onChange={(e) => handleZoneChange(idx, 'zoneId', e.target.value)} className="w-full bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50" required />
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Name</label>
                        <input type="text" value={zone.name} onChange={(e) => handleZoneChange(idx, 'name', e.target.value)} className="w-full bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50" required />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Price</label>
                        <input type="number" value={zone.price} onChange={(e) => handleZoneChange(idx, 'price', e.target.value)} className="w-full bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50" required />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Color</label>
                        <input type="text" value={zone.color} onChange={(e) => handleZoneChange(idx, 'color', e.target.value)} className="w-full bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50" />
                      </div>
                      <div className="col-span-1 sm:col-span-1">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Rows</label>
                        <input type="number" value={zone.rows} onChange={(e) => handleZoneChange(idx, 'rows', e.target.value)} className="w-full bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50" required />
                      </div>
                      <div className="col-span-1 sm:col-span-1">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Cols</label>
                        <input type="number" value={zone.cols} onChange={(e) => handleZoneChange(idx, 'cols', e.target.value)} className="w-full bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500/50" required />
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex items-center justify-end h-[34px]">
                        <button type="button" onClick={() => removeZone(idx)} className="p-1.5 rounded-lg hover:bg-pink-500/10 text-gray-500 hover:text-pink-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {form.zones.length === 0 && (
                    <div className="text-center py-4 bg-surface-950 rounded-xl border border-white/5 border-dashed">
                      <p className="text-xs text-gray-500">No zones added. Click "Add Zone" to create one.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-surface-800 text-gray-300 text-sm font-semibold hover:bg-surface-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
                >
                  {editingId ? "Save Changes" : "Add Concert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface-900 border border-white/10 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-pink-500/15 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-2">Delete Concert</h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete this concert? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 rounded-xl bg-surface-800 text-gray-300 text-sm font-semibold hover:bg-surface-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
