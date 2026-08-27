import { useTranslation } from "react-i18next";

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      id: 1,
      title: "Choose Your Vibe",
      desc: "Browse through our exclusive list of upcoming concerts and events.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Pick Your Seat",
      desc: "Select the perfect spot using our interactive, real-time seating chart.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Enjoy the Show",
      desc: "Get your digital ticket instantly and prepare for an unforgettable night.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative overflow-hidden pt-10 pb-24 bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl md:text-5xl">
            How It <span className="text-gradient-pink-blue">Works</span>
          </h2>
          <p className="mt-4 text-gray-400">Your journey to the best live experience in 3 simple steps.</p>
        </div>

        <div className="relative grid gap-12 md:grid-cols-3">
          {/* Decorative Dashed Line connecting the steps (hidden on mobile) */}
          <div className="absolute top-12 left-1/6 right-1/6 hidden h-0.5 border-t-2 border-dashed border-white/10 md:block" />

          {steps.map((step) => (
            <div key={step.id} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-surface-900 shadow-xl">
                {step.icon}
                <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface-800 text-sm font-bold text-white shadow-lg border border-white/10">
                  {step.id}
                </div>
              </div>
              <h3 className="mt-8 font-display text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
