import Navbar from "@/components/Navbar";
import SplitHero from "@/components/SplitHero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <SplitHero />
      <About />
      <Skills />
      <Experience />
      <Education />
      <Footer />
    </main>
  );
}
