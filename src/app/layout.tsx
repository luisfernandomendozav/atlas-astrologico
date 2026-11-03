import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas Astrológico · Un instante, muchas perspectivas",
  description: "Prueba de concepto: posiciones del cielo y ángulos locales para cualquier instante y lugar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
