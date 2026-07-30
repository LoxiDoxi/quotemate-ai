export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

      <div className="max-w-md text-center">

        <div className="text-6xl mb-6">
          🎉
        </div>

        <h1 className="text-4xl font-black">
          Welcome to QuoteMate Pro
        </h1>

        <p className="mt-4 text-slate-300">
          Your subscription is active. You now have access to Pro features.
        </p>

        <a
          href="/dashboard"
          className="inline-block mt-8 rounded-xl bg-blue-600 px-6 py-3 font-bold"
        >
          Go to dashboard
        </a>

      </div>

    </main>
  );
}