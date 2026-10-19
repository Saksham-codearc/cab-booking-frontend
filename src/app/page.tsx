import Link from "next/link";

import Logo from "@/components/Logo";
import {
  ArrowRightIcon,
  AutoIcon,
  BikeIcon,
  BoltIcon,
  CarIcon,
  CheckIcon,
  ParcelIcon,
  PinIcon,
  ReceiptIcon,
  RupeeIcon,
  ShieldIcon,
  StarIcon,
} from "@/components/icons";

const NAV = [
  { href: "#services", label: "Services" },
  { href: "#how", label: "How it works" },
  { href: "#why", label: "Why RideFlow" },
];

const SERVICES = [
  {
    Icon: CarIcon,
    name: "Ride Standard",
    price: "from ₹50",
    copy: "Everyday cars for your daily commute.",
  },
  {
    Icon: StarIcon,
    name: "Ride Premium",
    price: "from ₹120",
    copy: "Newer, comfier cars and top-rated drivers.",
  },
  {
    Icon: ParcelIcon,
    name: "Ride XL",
    price: "from ₹150",
    copy: "SUVs and vans for groups and luggage.",
  },
];

const STEPS = [
  {
    title: "Set pickup and drop",
    copy: "Type where you are and where you are going. No haggling, no calls.",
  },
  {
    title: "See your fare upfront",
    copy: "Every ride type shows its price before you book — calculated on our servers.",
  },
  {
    title: "Book and track",
    copy: "Confirm your ride and follow its status from your dashboard.",
  },
];

const REASONS = [
  {
    Icon: RupeeIcon,
    title: "Upfront pricing",
    copy: "The price you see is computed server-side from distance and ride type.",
  },
  {
    Icon: ShieldIcon,
    title: "Protected accounts",
    copy: "Every booking sits behind a verified sign-in. Your rides stay yours.",
  },
  {
    Icon: ReceiptIcon,
    title: "Ride history",
    copy: "Past trips, fares and statuses in one place, ready when you need them.",
  },
  {
    Icon: BoltIcon,
    title: "Quick booking",
    copy: "Two fields, one tap. Pick up where you left off next time.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-40 border-b border-brand-600/50 bg-brand-500">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link href="/" aria-label="RideFlow home">
            <Logo />
          </Link>

          <nav
            aria-label="Sections"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-ink-900/10"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="rounded-full px-3.5 py-2 text-sm font-semibold transition hover:bg-ink-900/10"
            >
              Sign in
            </Link>
            <Link href="/sign-up" className="btn-ink px-4 py-2.5 text-sm">
              Book a ride
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-brand-500">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-12 pt-8 lg:grid-cols-[1.05fr_minmax(0,25rem)] lg:items-center lg:gap-14 lg:px-8 lg:pb-20 lg:pt-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-500">
                <BoltIcon className="h-4 w-4" />
                Now live in Delhi NCR
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Your everyday ride,
                <span className="block">one tap away.</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-ink-900/80 sm:text-lg">
                Cars for the commute, SUVs for the group trip — set your pickup
                and drop, see the fare upfront, and book in seconds.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/sign-up" className="btn-ink px-6 py-4 text-base">
                  Get started
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-full border-2 border-ink-900 px-6 py-4 text-base font-bold transition hover:bg-ink-900 hover:text-brand-500"
                >
                  I already have an account
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
                {[
                  "Upfront fares",
                  "Cancel before pickup",
                  "Ride history",
                ].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Booking preview card */}
            <div className="rounded-4xl bg-white p-5 shadow-pop lg:p-6">
              <div className="flex items-center justify-between">
                <p className="text-lg font-extrabold tracking-tight">
                  Book a ride
                </p>
                <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide">
                  Upfront fare
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-ink-200">
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <span className="text-[15px] text-ink-400">
                    Enter pickup location
                  </span>
                </div>
                <div className="mx-4 border-t border-ink-100" />
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-rose-500 ring-4 ring-rose-100" />
                  <span className="text-[15px] text-ink-400">
                    Enter drop location
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { Icon: CarIcon, label: "Ride Standard", price: "₹149" },
                  { Icon: StarIcon, label: "Ride Premium", price: "₹238" },
                  { Icon: ParcelIcon, label: "Ride XL", price: "₹278" },
                ].map(({ Icon, label, price }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-ink-200 p-3"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1 text-sm font-bold">{label}</span>
                    <span className="text-sm font-extrabold">{price}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/sign-up"
                className="btn-brand mt-4 w-full px-5 py-4 text-base"
              >
                Continue
                <ArrowRightIcon className="h-5 w-5" />
              </Link>

              <p className="mt-3 text-center text-[11px] text-ink-400">
                Sample fares for a ~10 km trip. Sign in to see live prices.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section
          id="services"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12 lg:px-8 lg:py-16"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Pick the ride that fits
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                Three ride types today — bikes, autos and parcels are on the
                roadmap.
              </p>
            </div>

            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
            >
              See live fares
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ Icon, name, price, copy }) => (
              <article
                key={name}
                className="rounded-3xl border border-ink-200 bg-white p-5 transition hover:border-ink-300"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500 text-ink-900">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-extrabold">{name}</h3>
                <p className="mt-1 text-sm text-ink-500">{copy}</p>
                <p className="mt-3 text-sm font-bold">{price}</p>
              </article>
            ))}

            <article className="rounded-3xl border border-dashed border-ink-300 bg-white p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-100 text-ink-700">
                <BikeIcon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-extrabold">More on the way</h3>
              <p className="mt-1 text-sm text-ink-500">
                Bike taxis, autos and parcel delivery are next.
              </p>
              <p className="mt-3 text-sm font-bold text-ink-400">Coming soon</p>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="scroll-mt-24 bg-ink-900 py-12 text-white lg:py-16"
        >
          <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Booking in three steps
            </h2>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-sm font-extrabold text-ink-900">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-extrabold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {step.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why */}
        <section
          id="why"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12 lg:px-8 lg:py-16"
        >
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Built to keep things simple
          </h2>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {REASONS.map(({ Icon, title, copy }) => (
              <article
                key={title}
                className="flex gap-4 rounded-3xl border border-ink-200 bg-white p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500 text-ink-900">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold">{title}</h3>
                  <p className="mt-1 text-sm text-ink-500">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Auto / bike teaser strip */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-12 lg:px-8 lg:pb-16">
          <div className="flex flex-col items-center justify-between gap-6 rounded-4xl bg-brand-500 p-7 sm:flex-row lg:p-10">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Ready when you are
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-900/80">
                Create an account, set your route and book your first ride in
                under a minute.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-2 text-sm font-semibold sm:inline-flex">
                <AutoIcon className="h-6 w-6" />
                <PinIcon className="h-6 w-6" />
              </span>
              <Link href="/sign-up" className="btn-ink px-6 py-4 text-base">
                Book a ride
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm text-ink-500">
                A ride-hailing booking experience for everyday trips.
              </p>
            </div>

            <div className="flex gap-12 text-sm">
              <div>
                <p className="font-bold">Product</p>
                <ul className="mt-3 space-y-2 text-ink-500">
                  <li>
                    <a href="#services" className="hover:text-ink-900">
                      Services
                    </a>
                  </li>
                  <li>
                    <a href="#how" className="hover:text-ink-900">
                      How it works
                    </a>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-ink-900">
                      My rides
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-bold">Account</p>
                <ul className="mt-3 space-y-2 text-ink-500">
                  <li>
                    <Link href="/sign-up" className="hover:text-ink-900">
                      Create account
                    </Link>
                  </li>
                  <li>
                    <Link href="/sign-in" className="hover:text-ink-900">
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-10 border-t border-ink-100 pt-6 text-xs text-ink-400">
            © RideFlow. Visual language inspired by leading Indian ride-hailing
            apps; not affiliated with any of them.
          </p>
        </div>
      </footer>

      {/* Mobile sticky call to action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <Link href="/sign-up" className="btn-brand w-full px-5 py-3.5 text-base">
          Book a ride
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
