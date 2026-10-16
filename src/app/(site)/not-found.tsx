import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-5xl">This road leads nowhere</h1>
      <p className="mt-3 text-grey">The page you were looking for does not exist or is no longer published.</p>
      <Link href="/" className="btn btn-emerald mt-8">Back to home</Link>
    </div>
  );
}
