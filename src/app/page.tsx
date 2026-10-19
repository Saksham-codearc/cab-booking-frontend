
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-3xl text-center">
        <div className="mb-8 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
          Your ride, your way
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Move smarter.
          <span className="block text-blue-400">Ride easier.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
          Book a ride, find your destination, and get moving.
          Your next journey starts here.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/sign-up"
           className="rounded-xl bg-blue-500 px-8 py-4 font-semibold text-white transition hover:bg-blue-600"
          >
          Get Started
          </Link>

          <Link
            href="/sign-in"
            className="rounded-xl border border-slate-600 px-8 py-4 font-semibold transition hover:bg-slate-800"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-12 text-sm text-slate-500">
          Simple, reliable rides for everyday journeys.
        </p>
      </div>
    </main>
  );
}
