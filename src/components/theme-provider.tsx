"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Roomba is dark-first. Neon Auth's UI provider bundles a next-themes provider
 * with `enableSystem`, which would otherwise resolve <html> to the OS theme and
 * strip our `dark` class. Forcing the theme here pins the product to dark until a
 * light toggle is explicitly added.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
