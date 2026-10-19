import { auth } from "@clerk/nextjs/server";

export const instant = false;

export default async function ProfileTestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();

  return children;
}
