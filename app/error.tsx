"use client";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-red-600">Unable to load gallery</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">The IIIF collection could not be loaded.</h1>
        <p className="mt-4 text-slate-600">
          {error.message || "Check the configured collection URL and try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-4"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
