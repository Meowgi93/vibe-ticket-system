import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: t("nav_home"), to: "/" },
    { label: t("nav_concerts"), to: "/concerts" },
    { label: t("nav_my_tickets"), to: "/my-tickets" },
    { label: t("nav_about"), to: "/about" },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "th" : "en";
    i18n.changeLanguage(nextLang);
  };


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 relative">
        {/* ── Brand ── */}
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-pink-400 to-lime-400 shadow-lg shadow-brand-500/25 transition-shadow group-hover:shadow-brand-500/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          <span className="font-display text-2xl font-black tracking-tight text-white">
            VI<span className="text-gradient-vibe">BE</span>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:rounded-full after:transition-all ${
                isActive(link.to)
                  ? "text-white after:w-full after:bg-gradient-to-r after:from-brand-500 after:to-lime-400"
                  : "text-gray-400 after:w-0 after:bg-brand-500 hover:text-white hover:after:w-full"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Desktop Actions ── */}
        <div className="hidden items-center gap-4 lg:flex">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {i18n.language === 'en' ? 'EN' : 'TH'}
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-brand-500/30 hover:bg-surface-700"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-lime-400 text-xs font-bold text-white">
                  {(user.fullName || user.username || '?').charAt(0).toUpperCase()}
                </span>
                {user.fullName || user.username}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/10 bg-surface-900 shadow-2xl shadow-black/40">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white rounded-t-xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                  <Link
                    to="/my-tickets"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    My Tickets
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-lime-400 transition-colors hover:bg-white/5 hover:text-lime-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                  <div className="h-px bg-white/5" />
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-pink-400 transition-colors hover:bg-pink-400/10 rounded-b-xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              id="sign-in-btn"
              className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 hover:brightness-110 active:scale-95"
            >
              {t("nav_sign_in")}
            </Link>
          )}
        </div>

        {/* ── Mobile ── */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center rounded-lg border border-white/10 p-2 text-xs font-bold text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            {i18n.language === 'en' ? 'EN' : 'TH'}
          </button>

          <button
            id="mobile-menu-toggle"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-surface-800 hover:text-white"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <div className={`overflow-hidden transition-all duration-300 lg:hidden ${mobileOpen ? "max-h-96 border-t border-white/5" : "max-h-0"}`}>
        <div className="flex flex-col gap-3 px-6 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${isActive(link.to) ? "text-lime-400" : "text-gray-400 hover:text-white"}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="h-px bg-white/5" />
              <p className="text-xs text-gray-500">Signed in as <span className="text-white">{user.fullName || user.username}</span></p>
              <Link
                to="/profile"
                className="mt-2 block w-full rounded-xl bg-surface-800 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-surface-700"
                onClick={() => setMobileOpen(false)}
              >
                My Profile
              </Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="mt-1 block w-full rounded-xl border border-pink-400/20 bg-pink-400/10 py-2.5 text-center text-sm font-semibold text-pink-400 transition-all hover:bg-pink-400/20"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="mt-1 block w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-2.5 text-center text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
              onClick={() => setMobileOpen(false)}
            >
              {t("nav_sign_in")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
