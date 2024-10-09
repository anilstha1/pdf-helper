import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import {Toaster} from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "PDF Helper",
  description: "Chat with your PDF documents",
};

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {children}
            <Toaster />
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
