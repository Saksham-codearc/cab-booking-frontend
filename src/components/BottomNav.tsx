"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CarIcon, HomeIcon, ReceiptIcon } from "@/components/icons";

const ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/dashboard", label: "Book", Icon: CarIcon },
  { href: "/dashboard#rides", label: "Rides", Icon: ReceiptIcon },
];

/** Mobile app-style bottom navigation. Hidden on desktop. */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                  active ? "text-ink-900" : "text-ink-400 hover:text-ink-700"
                }`}
              >
                <span
                  className={`grid h-8 w-14 place-items-center rounded-full transition ${
                    active ? "bg-brand-500" : "bg-transparent"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
