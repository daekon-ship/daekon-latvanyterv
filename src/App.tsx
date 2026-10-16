import { useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./hero/Hero";
import { KineticBand } from "./components/KineticBand";
import { Kiosz } from "./components/Kiosz";
import { Works } from "./components/Works";
import { Services } from "./components/Services";
import { Reviews } from "./components/Reviews";
import { About } from "./components/About";
import { Process } from "./components/Process";
import { Faq } from "./components/Faq";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { ScrollTrigger, initReveals } from "./lib/motion";

export function App() {
  useEffect(() => {
    const stop = initReveals();
    // a betűtípusok és képek után újramérjük a rögzített jeleneteket
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      stop();
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#fo-tartalom">
        Ugrás a tartalomra
      </a>
      <Header />
      <main id="fo-tartalom" tabIndex={-1}>
        <Hero />
        <KineticBand />
        <Kiosz />
        <Works />
        <Services />
        <Reviews />
        <About />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
