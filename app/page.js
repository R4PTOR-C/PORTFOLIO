import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Fenrys from "@/components/Fenrys";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative z-10">
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <Fenrys />
      <Projects />
      <Stack />
      <Experience />
      <Contact />
      <Footer />
    </main>
  );
}
