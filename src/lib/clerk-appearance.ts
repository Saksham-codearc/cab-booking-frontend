/**
 * Shared Clerk theming so the auth screens match the app's brand instead of
 * Clerk's default look.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#ffd400",
    colorText: "#111111",
    colorTextSecondary: "#71717a",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#111111",
    colorDanger: "#e11d48",
    borderRadius: "0.9rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    card: "shadow-[0_18px_50px_-24px_rgba(17,17,17,0.35)]",
    formButtonPrimary: "font-bold hover:bg-brand-400",
    footerActionLink: "font-semibold",
  },
};
