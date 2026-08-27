export default function StaticPage({ title, content }) {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-surface-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/5 bg-surface-900 p-8 sm:p-12 shadow-2xl">
          <h1 className="font-display text-3xl font-bold text-white mb-6 pb-6 border-b border-white/10">
            {title}
          </h1>
          <div className="text-gray-400 leading-relaxed space-y-4">
            {content ? (
              content
            ) : (
              <>
                <p>
                  This page is currently under construction. The content for <strong>{title}</strong> will be updated here shortly.
                </p>
                <p>
                  If you need immediate assistance, please reach out to our support team. Thank you for your patience!
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
