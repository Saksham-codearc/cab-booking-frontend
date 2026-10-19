import { auth } from "@clerk/nextjs/server";

// Session reads are runtime data, so this segment blocks instead of prerendering.
export const instant = false;

export default async function RidesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();

  return children;
}
