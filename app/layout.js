import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import LoadingScreen from "@/components/LoadingScreen";
import UFO from "@/components/UFO";
import Cursor from "@/components/Cursor";
import StarField from "@/components/StarField";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Rafael Caldas | Software Engineer",
  description: "Full Stack Software Engineer based in Goiânia, GO. Ruby on Rails, JavaScript, React, Node.js.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <LoadingScreen />
          <StarField />
          <ScrollProgress />
          <UFO />
          <Cursor />
          <BackToTop />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
