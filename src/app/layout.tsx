import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Nova AI • Enterprise Voice & Chat Assistant",
  description: "Full-Screen Real-time AI Voice & Chat Assistant powered by Groq",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${poppins.variable} font-sans antialiased bg-slate-950 text-slate-100 h-screen w-screen overflow-hidden select-none`}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: 500,
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#0f172a",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "#0f172a",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}