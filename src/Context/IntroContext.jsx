import { createContext, useContext } from "react";

// Drives the homepage cinematic intro. Stages run in order:
//   "loading"     → full-screen loader with progress
//   "journey"     → scroll-driven showcase of the four branches
//   "heroReveal"  → journey gone, only the hero background visible (~0.5s)
//   "ui"          → staggered entrance of navbar + hero UI
//   "done"        → intro finished (also the default on any non-home page or
//                   when the intro was already played this browser session)
//
// Consumers outside the provider (other pages) get "done", so they render
// completely normally with no animation.
export const IntroContext = createContext({ stage: "done" });

export const useIntro = () => useContext(IntroContext);
