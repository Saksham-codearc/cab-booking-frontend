import { auth } from "@clerk/nextjs/server";

// Auth checks use runtime data (cookies), so this segment must be allowed to block.
export const instant = false;

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Redirects signed-out visitors to the sign-in page.
  await auth.protect();

  return children;
}
