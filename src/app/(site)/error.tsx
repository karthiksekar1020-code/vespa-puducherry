"use client";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-5xl">We hit a bump</h1>
      <p className="mt-3 text-grey">Please try again. If it keeps happening, contact the showroom.</p>
      <button onClick={reset} className="btn btn-emerald mt-8">Try again</button>
    </div>
  );
}
