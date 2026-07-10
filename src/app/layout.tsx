import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const prompt = localFont({
  variable: "--font-prompt",
  src: [
    { path: "../fonts/prompt/Prompt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/prompt/Prompt-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/prompt/Prompt-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/prompt/Prompt-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Portal Skap 2.0 - CDD Presidente Prudente",
  description: "Acompanhamento da sua avaliação SKAP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={prompt.variable}>
      <body>{children}</body>
    </html>
  );
}
