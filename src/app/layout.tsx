import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nova AI • Enterprise Voice & Chat Workspace",
  description: "Next-Generation Real-Time Conversational AI Agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${poppins.className} bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}
      >
        {children}
      </body>
    </html>
  );
}