import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remont Leads Clean",
  description: "Чистый новый проект для лендинга по заявкам в нише ремонта под ключ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
