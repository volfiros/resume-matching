import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hiring agent",
  description:
    "Hiring agent that can review candidates' resume and based on the job description provide a decision for the next step",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
