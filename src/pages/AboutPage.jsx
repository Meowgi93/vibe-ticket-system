import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t("ab_f1_title"),
      description: t("ab_f1_desc"),
      color: "text-lime-400",
      bg: "bg-lime-400/10",
      border: "border-lime-400/20",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t("ab_f2_title"),
      description: t("ab_f2_desc"),
      color: "text-brand-400",
      bg: "bg-brand-400/10",
      border: "border-brand-400/20",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t("ab_f3_title"),
      description: t("ab_f3_desc"),
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      border: "border-pink-400/20",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: t("ab_f4_title"),
      description: t("ab_f4_desc"),
      color: "text-lime-400",
      bg: "bg-lime-400/10",
      border: "border-lime-400/20",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t("ab_f5_title"),
      description: t("ab_f5_desc"),
      color: "text-brand-400",
      bg: "bg-brand-400/10",
      border: "border-brand-400/20",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: t("ab_f6_title"),
      description: t("ab_f6_desc"),
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      border: "border-pink-400/20",
    },
  ];



  return (
    <div className="min-h-screen pt-20">
      <section className="relative overflow-hidden pt-6 pb-20 sm:pt-8 sm:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-500/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-lime-400/8 blur-[100px]" />
          <div className="absolute left-0 bottom-0 h-80 w-80 rounded-full bg-pink-400/6 blur-[100px]" />

          <div className="absolute left-[15%] top-[25%] h-2 w-2 animate-float rounded-full bg-lime-400/50" />
          <div className="absolute right-[20%] top-[20%] h-3 w-3 animate-float-delay rounded-full bg-pink-400/40" />
          <div className="absolute left-[40%] bottom-[30%] h-2 w-2 animate-float rounded-full bg-brand-400/40" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">

          <h1 className="animate-fade-in-up-delay-1 font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            {t("ab_title_1")}
            <br />
            <span className="text-gradient-vibe">{t("ab_title_2")}</span>
          </h1>
          <p className="animate-fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
            {t("ab_desc")}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "200+", label: t("stat_shows"), color: "from-brand-500 to-brand-600" },
              { value: "50K+", label: t("ab_happy_fans"), color: "from-lime-400 to-lime-500" },
              { value: "35+", label: t("stat_cities"), color: "from-pink-400 to-pink-500" },
              { value: "99%", label: t("ab_satisfaction"), color: "from-brand-400 to-lime-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-surface-900 p-6 text-center">
                <p className={`bg-gradient-to-r ${stat.color} bg-clip-text font-display text-3xl font-black text-transparent sm:text-4xl`}>
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-medium text-gray-500 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">

            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              {t("ab_built_for")} <span className="text-gradient-blue-lime">{t("ab_music_lovers")}</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="animate-fade-in-up group rounded-2xl border border-white/5 bg-surface-900 p-6 transition-all hover:border-white/10 hover:shadow-xl"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-surface-800 to-surface-900 px-8 py-14 text-center shadow-2xl sm:px-14">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-[80px]" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-32 w-32 translate-x-1/3 translate-y-1/3 rounded-full bg-lime-400/10 blur-[60px]" />

            <h2 className="relative font-display text-3xl font-extrabold text-white sm:text-4xl">
              {t("ab_ready")} <span className="text-gradient-vibe">VIBE</span>?
            </h2>
            <p className="relative mt-4 text-gray-400">
              {t("ab_join")}
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/concerts"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-500/25 transition-all hover:shadow-brand-500/40 hover:brightness-110 active:scale-95"
              >
                {t("hero_btn_explore")}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-gray-300 transition-all hover:border-lime-400/20 hover:bg-lime-400/5 hover:text-white active:scale-95"
              >
                {t("ab_create_account")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
