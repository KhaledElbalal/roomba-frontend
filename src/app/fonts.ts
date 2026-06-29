// Roomba type system wired through next/font so the @theme --font-* vars resolve.
// Space Grotesk = UI/display, JetBrains Mono = code/metadata/labels/numerics.
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
