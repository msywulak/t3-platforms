import { GeistMono, GeistSans } from "geist/font";

export const fontMapper = {
  "font-sans": GeistSans.variable,
  "font-mono": GeistMono.variable,
} as Record<string, string>;
