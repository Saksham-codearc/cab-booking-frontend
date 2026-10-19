import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BikeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M9 17h3.5l2-5.5h-3" />
      <path d="M14.5 11.5h2l1.5 5.5" />
      <path d="M15.5 8h3" />
    </Svg>
  );
}

export function AutoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 16.5v-6A2.5 2.5 0 0 1 6.5 8H12l3 4.5h3.5A2.5 2.5 0 0 1 21 15v1.5" />
      <path d="M9 8v4.5" />
      <circle cx="8" cy="17.5" r="2.2" />
      <circle cx="16.5" cy="17.5" r="2.2" />
    </Svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 16v-2.6L6 8.5h12l2 4.9V16" />
      <path d="M4 16h16" />
      <path d="M6.2 12.8h11.6" />
      <circle cx="7.5" cy="17.6" r="1.7" />
      <circle cx="16.5" cy="17.6" r="1.7" />
    </Svg>
  );
}

export function ParcelIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
      <path d="m4 7 8 4 8-4" />
      <path d="M12 11v10" />
    </Svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-4.7 7-10a7 7 0 1 0-14 0c0 5.3 7 10 7 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </Svg>
  );
}

export function SwapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 4v14" />
      <path d="m4 15 3 3 3-3" />
      <path d="M17 20V6" />
      <path d="m14 9 3-3 3 3" />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3l7 3v5.7c0 4.3-2.9 7.9-7 9.3-4.1-1.4-7-5-7-9.3V6l7-3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </Svg>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-8Z" />
      <path d="M4 9.5h13" />
      <path d="M16.6 13.6h.01" />
    </Svg>
  );
}

export function RupeeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 4h10" />
      <path d="M7 9h10" />
      <path d="M14.5 4c0 3.4-2.2 5-5.5 5H7" />
      <path d="M12.2 9 18 20" />
    </Svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.4l-5.8 3.1 1.1-6.45-4.7-4.6 6.5-.95L12 2.6Z"
      />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z" />
      <path d="M9.5 21v-5.5h5V21" />
    </Svg>
  );
}

export function ReceiptIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 3h12v18l-3-1.8-3 1.8-3-1.8L6 21V3Z" />
      <path d="M9.5 8h5" />
      <path d="M9.5 12h5" />
    </Svg>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 11h16v9.5H4z" />
      <path d="M3 7h18v4H3z" />
      <path d="M12 7v13.5" />
      <path d="M12 7S10.4 3 8.4 3a2 2 0 0 0 0 4H12Z" />
      <path d="M12 7s1.6-4 3.6-4a2 2 0 0 1 0 4H12Z" />
    </Svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.6 20.4a7.6 7.6 0 0 1 14.8 0" />
    </Svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="m10 8-4 4 4 4" />
      <path d="M6 12h9" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.8 4.6 4.6L19 7" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 2.5 4.5 14H10l-1 7.5L18.5 10H13l0-7.5Z" />
    </Svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 3.5h2.2l1.6 4-2 1.4a12 12 0 0 0 6.8 6.8l1.4-2 4 1.6v2.2a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
    </Svg>
  );
}
