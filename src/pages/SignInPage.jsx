import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useBehaviorTracker } from "../hooks/useBehaviorTracker";

export default function SignInPage() {
  const { getData } = useBehaviorTracker();
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [honeypot, setHoneypot] = useState(""); // ช่องซ่อนดักบอท
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (tab === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, behavior: getData() })
        });
        const data = await res.json();
        if (data.challenge) {
          navigate('/challenge', { state: { challengeType: data.challenge, email, tempToken: data.tempToken } });
          return;
        }
        if (!res.ok) throw new Error(data.error || 'Login failed');
        const userData = { ...data.user, role: data.user?.role || 'user' };
        localStorage.setItem('vibe_token', data.token);
        localStorage.setItem('vibe_user', JSON.stringify(userData));
        window.location.href = '/';
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, fullName, email, phone, password, honeypot, behavior: getData() })
        });
        const data = await res.json();
        if (data.challenge) {
          navigate('/challenge', { state: { challengeType: data.challenge, email, tempToken: data.tempToken } });
          return;
        }
        if (!res.ok) {
          // ดึงรายละเอียด Error ทีละข้อมาแสดง (ถ้ามี)
          const errorMsg = data.details ? data.details.join(' และ ') : (data.error || 'Registration failed');
          throw new Error(errorMsg);
        }
        const userData = { ...data.user, role: 'user' };
        localStorage.setItem('vibe_token', data.token);
        localStorage.setItem('vibe_user', JSON.stringify(userData));
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20 pb-12">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/8 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-pink-400/6 blur-[100px]" />
        <div className="absolute left-1/4 bottom-1/4 h-48 w-48 rounded-full bg-lime-400/5 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="animate-fade-in-up mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-pink-400 to-lime-400 shadow-lg shadow-brand-500/25">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span className="font-display text-2xl font-black tracking-tight text-white">
              VI<span className="text-gradient-vibe">BE</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-gray-500">{t("si_gateway")}</p>
        </div>

        <div className="animate-fade-in-up-delay-1 rounded-2xl border border-white/5 bg-surface-900 p-8 shadow-2xl shadow-black/30">
          {/* Tabs */}
          <div className="flex rounded-xl bg-surface-800 p-1">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                tab === "login"
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >{t("si_sign_in")}</button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                tab === "register"
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >{t("si_register")}</button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* ――― Honeypot Field (ช่องซ่อนดักบอท - มนุษย์จริงไม่เห็นช่องนี้) ――― */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex="-1"
                autoComplete="off"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
              />
            </div>
            {tab === "register" && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-400">ชื่อผู้ใช้ (Username)</label>
                  <input
                    id="username" type="text" required placeholder="johndoe"
                    value={username} onChange={e => setUsername(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-400">ชื่อ-นามสกุลจริง (Full Name)</label>
                  <input
                    id="fullname" type="text" required placeholder="John Doe"
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-400">เบอร์โทรศัพท์ (Phone)</label>
                  <input
                    id="phone" type="tel" required placeholder="0812345678"
                    value={phone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, ''); // ลบตัวอักษรที่ไม่ใช่ตัวเลขออก
                      if (val.length <= 10) setPhone(val); // จำกัดความยาวไม่เกิน 10 ตัว
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">{t("si_email")}</label>
              <input
                id="email" type="email" required placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">{t("si_password")}</label>
              <div className="relative mt-2">
                <input
                  id="password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 pr-14 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  {showPassword ? "ซ่อน" : "แสดง"}
                </button>
              </div>
            </div>

            {tab === "register" && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-400">{t("si_confirm_password")}</label>
                <div className="relative mt-2">
                  <input
                    id="confirm-password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-surface-800 px-4 py-3 pr-14 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-white"
                  >
                    {showPassword ? "ซ่อน" : "แสดง"}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-pink-400/20 bg-pink-400/10 px-4 py-3 text-sm text-pink-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {tab === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                tab === "login" ? t("si_sign_in") : t("si_create_account")
              )}
            </button>
          </form>
        </div>

        <p className="animate-fade-in-up-delay-2 mt-6 text-center text-xs text-gray-600">
          {t("si_terms")}
        </p>
      </div>
    </div>
  );
}
