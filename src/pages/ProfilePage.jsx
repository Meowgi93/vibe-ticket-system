import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    } else {
      setUsername(user.username || "");
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(username, fullName, email, phone, password);
      setSuccess("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen pt-20 pb-24">
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(236,72,153,0.08),transparent_70%)]" />
        <div className="pointer-events-none absolute right-0 top-1/4 h-48 w-48 rounded-full bg-brand-500/5 blur-[80px]" />
        
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-lime-400 text-4xl font-bold text-white shadow-lg shadow-brand-500/20">
                {user.fullName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold text-white">{user.fullName || user.username}</h1>
                <p className="mt-1 text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-pink-400/20 bg-pink-400/10 px-5 py-2.5 text-sm font-semibold text-pink-400 transition-all hover:bg-pink-400/20 active:scale-95"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-10 rounded-2xl border border-white/5 bg-surface-900 p-6 sm:p-10 shadow-2xl shadow-black/30">
            <h2 className="font-display text-xl font-bold text-white mb-6">Edit Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
                  <input
                    id="username" type="text" required
                    value={username} onChange={e => setUsername(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-400">Full Name</label>
                  <input
                    id="fullname" type="text" required
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-400">Phone</label>
                  <input
                    id="phone" type="tel" required
                    value={phone} onChange={e => setPhone(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email Address</label>
                  <input
                    id="email" type="email" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="my-8 h-px bg-white/5" />
              
              <h3 className="font-display text-lg font-semibold text-white mb-4">Change Password</h3>
              <p className="text-xs text-gray-500 mb-6">Leave blank if you do not want to change your password.</p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-400">New Password</label>
                  <input
                    id="password" type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-400">Confirm New Password</label>
                  <input
                    id="confirm-password" type="password" placeholder="••••••••"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-pink-400/20 bg-pink-400/10 px-4 py-3 text-sm text-pink-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 px-4 py-3 text-sm text-lime-400">
                  {success}
                </div>
              )}

              <div className="pt-4 text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
