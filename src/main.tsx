import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/hero.css";
import "./styles/sections.css";
import { reducedMotion } from "./lib/motion";


document.documentElement.classList.add("js");
if (reducedMotion()) document.documentElement.classList.add("reduce-motion");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
