import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import StarField from "@/components/StarField";
import ScrollProgress from "@/components/ScrollProgress";
import UFO from "@/components/UFO";
import Loader from "@/components/Loader";
import BackToTop from "@/components/BackToTop";

/* Three type roles. Unbounded carries display (wide, spacey), Geist
   carries running text, Geist Mono carries anything a machine would have
   written. */
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const SITE = "https://rafaelcaldas.dev";
const DESCRIPTION =
  "Engenheiro de software full-stack em Goiânia, GO. Ruby on Rails, JavaScript, React, Node.js e PostgreSQL.";

export const metadata = {
  metadataBase: new URL(SITE),
  title: "Rafael Caldas | Software Engineer",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  keywords: [
    "Rafael Caldas", "software engineer", "full stack", "Ruby on Rails",
    "React", "Next.js", "Node.js", "PostgreSQL", "Goiânia",
  ],
  authors: [{ name: "Rafael Caldas", url: "https://github.com/R4PTOR-C" }],
  openGraph: {
    type: "profile",
    siteName: "Rafael Caldas",
    title: "Rafael Caldas | Software Engineer",
    description: DESCRIPTION,
    url: SITE,
    locale: "pt_BR",
    alternateLocale: ["en_US"],
    images: [{ url: "/perfil.jpg", width: 1024, height: 1536, alt: "Rafael Caldas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rafael Caldas | Software Engineer",
    description: DESCRIPTION,
    images: ["/perfil.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#050b14",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* First visit of the session: show the arrival loader (ufo-boot) and
            hide the headline letters before first paint so the saucer can
            drop them in. Once per session, never under reduced motion, and
            it undoes itself if the game script never shows up. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('ufo.intro')){var d=document.documentElement;d.classList.add('ufo-intro','ufo-boot');setTimeout(function(){d.classList.remove('ufo-boot','ufo-boot-exit')},4500);setTimeout(function(){d.classList.remove('ufo-intro')},11000)}}catch(e){}",
          }}
        />
      </head>
      <body
        className={`${unbounded.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <I18nProvider>
          <a
            href="#about"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-card focus:text-neon focus:border focus:border-neon/40"
          >
            Pular para o conteúdo
          </a>
          <Loader />
          <StarField />
          <ScrollProgress />
          <UFO />
          <BackToTop />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
